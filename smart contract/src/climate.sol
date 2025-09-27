// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IClimaLinkToken {
    function mint(address to, uint256 amount) external;
    function getBalanceOfUser(address user) external view returns (uint256);
    function isEligibleForMinting(address user) external view returns (bool);
    function getStakedAmount(address user) external view returns (uint256);
}

interface IClimaLinkDao {
    function isMember(address user) external view returns (bool);
    function getActiveMembers() external view returns (uint256);
}

contract ClimaLinkClimate is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    
    enum ReportStatus { Pending, Validated, Rejected, VotingInProgress }
    enum Role { None, Reporter, Validator }
    enum VoteChoice { Invalid, Valid }

    struct ReportData {
        string weather;
        string location;
        int128 temperature;
        int128 longitude;
        int128 latitude;
        uint128 humidity;
    }

    struct Report {
        ReportData data;
        address reporter;
        uint256 timestamp;
        ReportStatus status;
        uint256 validationDeadline;
        uint256 validVotes;
        uint256 invalidVotes;
        uint256 totalValidators;
        bool rewardsDistributed;
    }

    struct ReportVoting {
        mapping(address => bool) hasVoted;
        mapping(address => VoteChoice) votes;
        address[] voters;
    }

    struct ValidatorInfo {
        bool isActive;
        uint256 reportsValidated;
        uint256 correctVotes;
        uint256 totalRewardsEarned;
        uint256 lastActiveTimestamp;
    }

    // State variables
    mapping(uint128 => Report) public reports;
    mapping(uint128 => ReportVoting) private reportVoting;
    mapping(address => Role) public userRoles;
    mapping(address => ValidatorInfo) public validatorInfo;
    
    uint128 public reportCount;
    uint256 public totalValidators;
    address[] public validatorList;
    mapping(address => uint256) public validatorIndex;

    // Constants
    uint256 public constant VALIDATION_PERIOD = 24 hours;
    uint256 public constant REPORT_REWARD = 20 * 10**18;
    uint256 public constant VALIDATOR_REWARD_POOL = 10 * 10**18;
    uint256 public constant MIN_CLT_FOR_VALIDATOR = 1000 * 10**18;
    uint256 public constant MIN_BDAG_STAKE = 100 * 10**18;
    uint256 public constant MAX_VALIDATION_EXTENSION = 48 hours;
    uint256 public constant VALIDATOR_INACTIVITY_PERIOD = 30 days;

    // Configurable parameters (for governance)
    uint256 public minValidatorsRequired = 3; // Minimum validators needed for meaningful decentralization
    uint256 public consensusThreshold = 60; // 60% threshold for finalization (not used for early consensus)
    uint256 public maxReportsPerDay = 10;
    
    // NOTE: 
    // - Early consensus uses 51% of total validators (calculated dynamically)
    // - Not everyone can be validator - requires: DAO membership + 1000 CLT + 100 BDAG stake
    // - minValidatorsRequired prevents system from operating with too few validators (e.g., 1-2)
    
    // Rate limiting
    mapping(address => uint256) public lastReportTimestamp;
    mapping(address => uint256) public dailyReportCount;
    mapping(address => uint256) public lastReportDay;

    IClimaLinkToken public immutable tokenContract;
    IClimaLinkDao public immutable daoContract;

    // Events
    event ReportCreated(uint128 indexed reportId, address indexed reporter, string location);
    event ReportVoteCast(uint128 indexed reportId, address indexed validator, VoteChoice vote);
    event ReportFinalized(uint128 indexed reportId, ReportStatus status, uint256 validVotes, uint256 invalidVotes);
    event ValidatorRewardDistributed(uint128 indexed reportId, address indexed validator, uint256 amount);
    event ReporterRewarded(uint128 indexed reportId, address indexed reporter, uint256 amount);
    event RoleAssigned(address indexed user, Role role);
    event RoleUpgraded(address indexed user, Role oldRole, Role newRole);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator, string reason);
    event ValidatorInactive(address indexed validator, uint256 inactiveDays);
    event EmergencyReportFinalized(uint128 indexed reportId, address indexed admin);
    event ConfigurationUpdated(string parameter, uint256 oldValue, uint256 newValue);

    modifier onlyReporter() {
        require(
            userRoles[msg.sender] == Role.Reporter || userRoles[msg.sender] == Role.Validator,
            "CLIMATE: Not authorized to report"
        );
        _;
    }

    modifier onlyValidator() {
        require(
            validatorInfo[msg.sender].isActive && userRoles[msg.sender] == Role.Validator,
            "CLIMATE: Not an active validator"
        );
        _;
    }

    modifier validReport(uint128 reportId) {
        require(reportId > 0 && reportId <= reportCount, "CLIMATE: Invalid report ID");
        _;
    }

    modifier rateLimited() {
        require(_checkRateLimit(msg.sender), "CLIMATE: Rate limit exceeded");
        _;
    }

    constructor(
        address _tokenContract,
        address _daoContract
    ) Ownable(msg.sender) {
        require(_tokenContract != address(0), "CLIMATE: Invalid token contract");
        require(_daoContract != address(0), "CLIMATE: Invalid DAO contract");

        tokenContract = IClimaLinkToken(_tokenContract);
        daoContract = IClimaLinkDao(_daoContract);
        
        // Start with minimum of 3 validators required for meaningful consensus
        // Can be updated by governance later
        minValidatorsRequired = 3;
    }

    /**
     * @dev Join the system as reporter or validator
     */
    function joinSystem() external whenNotPaused returns (Role) {
        Role currentRole = userRoles[msg.sender];
        
        if (currentRole == Role.Validator) {
            _updateValidatorActivity(msg.sender);
            return currentRole;
        }

        Role newRole = _calculateRole(msg.sender);
        
        if (currentRole == Role.Reporter && newRole == Role.Validator) {
            _upgradeToValidator(msg.sender);
        } else if (currentRole == Role.None) {
            _assignRole(msg.sender, newRole);
        }
        
        return userRoles[msg.sender];
    }

    /**
     * @dev Create a climate report
     */
    function createReport(ReportData calldata data)
        external
        nonReentrant
        whenNotPaused
        onlyReporter
        rateLimited
        returns (uint128)
    {
        require(totalValidators >= minValidatorsRequired, "CLIMATE: Need more validators for decentralization");
        _validateReportData(data);

        uint128 reportId = ++reportCount;
        Report storage newReport = reports[reportId];
        
        newReport.data = data;
        newReport.reporter = msg.sender;
        newReport.timestamp = block.timestamp;
        newReport.status = ReportStatus.VotingInProgress;
        newReport.validationDeadline = block.timestamp.add(VALIDATION_PERIOD);
        newReport.totalValidators = totalValidators;


        emit ReportCreated(reportId, msg.sender, data.location);
        return reportId;
    }

    /**
     * @dev Vote on a report
     */
    function vote(uint128 reportId, VoteChoice choice)
        external
        nonReentrant
        whenNotPaused
        onlyValidator
        validReport(reportId)
    {
        Report storage report = reports[reportId];
        ReportVoting storage voting = reportVoting[reportId];
        
        require(report.status == ReportStatus.VotingInProgress, "CLIMATE: Not in voting phase");
        require(block.timestamp <= report.validationDeadline, "CLIMATE: Voting period ended");
        require(!voting.hasVoted[msg.sender], "CLIMATE: Already voted");
        require(report.reporter != msg.sender, "CLIMATE: Cannot vote on own report");

        // Record vote
        voting.hasVoted[msg.sender] = true;
        voting.votes[msg.sender] = choice;
        voting.voters.push(msg.sender);

        // Update vote counts
        if (choice == VoteChoice.Valid) {
            report.validVotes = report.validVotes.add(1);
        } else {
            report.invalidVotes = report.invalidVotes.add(1);
        }

        // Update validator activity
        _updateValidatorActivity(msg.sender);

        emit ReportVoteCast(reportId, msg.sender, choice);

        // Check for early consensus (51% of validators voted the same way)
        uint256 minValidatorsForConsensus = _getMinValidatorsForConsensus();
        
        if (report.validVotes >= minValidatorsForConsensus || report.invalidVotes >= minValidatorsForConsensus) {
            _finalizeReport(reportId);
        }
    }

    /**
     * @dev Finalize report after voting period
     */
    function finalizeReport(uint128 reportId)
        external
        whenNotPaused
        validReport(reportId)
    {
        Report storage report = reports[reportId];
        require(report.status == ReportStatus.VotingInProgress, "CLIMATE: Not in voting phase");
        require(
            block.timestamp > report.validationDeadline,
            "CLIMATE: Voting period not ended"
        );

        _finalizeReport(reportId);
    }

    /**
     * @dev Distribute rewards for a finalized report
     */
    function distributeRewards(uint128 reportId)
        external
        nonReentrant
        whenNotPaused
        validReport(reportId)
    {
        Report storage report = reports[reportId];
        require(
            report.status == ReportStatus.Validated || report.status == ReportStatus.Rejected,
            "CLIMATE: Report not finalized"
        );
        require(!report.rewardsDistributed, "CLIMATE: Rewards already distributed");

        report.rewardsDistributed = true;

        // Reward reporter if report was validated
        if (report.status == ReportStatus.Validated) {
            tokenContract.mint(report.reporter, REPORT_REWARD);
            emit ReporterRewarded(reportId, report.reporter, REPORT_REWARD);
        }

        // Distribute validator rewards
        _distributeValidatorRewards(reportId);
    }

    /**
     * @dev Check if user can upgrade to validator
     */
    function checkValidatorEligibility(address user) external view returns (bool) {
        return _canBeValidator(user);
    }

    /**
     * @dev Upgrade eligible reporter to validator
     */
    function upgradeToValidator() external whenNotPaused {
        require(userRoles[msg.sender] == Role.Reporter, "CLIMATE: Must be reporter");
        require(_canBeValidator(msg.sender), "CLIMATE: Not eligible for validator role");
        
        _upgradeToValidator(msg.sender);
    }



    // Internal functions

    function _getMinValidatorsForConsensus() internal view returns (uint256) {
        // 51% of total validators (majority)
        return totalValidators.mul(51).div(100).add(1);
    }

    function _calculateRole(address user) internal view returns (Role) {
        if (!daoContract.isMember(user)) {
            return Role.Reporter;
        }
        
        return _canBeValidator(user) ? Role.Validator : Role.Reporter;
    }

    function _canBeValidator(address user) internal view returns (bool) {
        return daoContract.isMember(user) &&
               tokenContract.getBalanceOfUser(user) >= MIN_CLT_FOR_VALIDATOR &&
               tokenContract.isEligibleForMinting(user) &&
               tokenContract.getStakedAmount(user) >= MIN_BDAG_STAKE;
    }

    function _assignRole(address user, Role role) internal {
        userRoles[user] = role;
        
        if (role == Role.Validator) {
            _addValidator(user);
        }
        
        emit RoleAssigned(user, role);
    }

    function _upgradeToValidator(address user) internal {
        Role oldRole = userRoles[user];
        userRoles[user] = Role.Validator;
        _addValidator(user);
        
        emit RoleUpgraded(user, oldRole, Role.Validator);
    }

    function _addValidator(address validator) internal {
        require(!validatorInfo[validator].isActive, "CLIMATE: Already validator");
        
        validatorInfo[validator] = ValidatorInfo({
            isActive: true,
            reportsValidated: 0,
            correctVotes: 0,
            totalRewardsEarned: 0,
            lastActiveTimestamp: block.timestamp
        });

        validatorList.push(validator);
        validatorIndex[validator] = validatorList.length - 1;
        totalValidators = totalValidators.add(1);

        emit ValidatorAdded(validator);
    }

   

    function _validateReportData(ReportData calldata data) internal pure {
        require(bytes(data.weather).length > 0 && bytes(data.weather).length <= 50, "CLIMATE: Invalid weather");
        require(data.temperature >= -100 && data.temperature <= 100, "CLIMATE: Invalid temperature");
        require(data.humidity <= 100, "CLIMATE: Invalid humidity");
        require(bytes(data.location).length > 0 && bytes(data.location).length <= 100, "CLIMATE: Invalid location");
        require(data.longitude >= -180000 && data.longitude <= 180000, "CLIMATE: Invalid longitude");
        require(data.latitude >= -90000 && data.latitude <= 90000, "CLIMATE: Invalid latitude");
    }

    function _finalizeReport(uint128 reportId) internal {
        Report storage report = reports[reportId];
        
        if (report.validVotes > report.invalidVotes) {
            report.status = ReportStatus.Validated;
        } else {
            report.status = ReportStatus.Rejected;
        }

        emit ReportFinalized(reportId, report.status, report.validVotes, report.invalidVotes);
    }

    function _distributeValidatorRewards(uint128 reportId) internal {
        Report storage report = reports[reportId];
        ReportVoting storage voting = reportVoting[reportId];
        
        VoteChoice winningChoice = (report.status == ReportStatus.Validated) 
            ? VoteChoice.Valid 
            : VoteChoice.Invalid;
        
        // Count winning validators
        uint256 winnerCount = 0;
        for (uint256 i = 0; i < voting.voters.length; i++) {
            if (voting.votes[voting.voters[i]] == winningChoice) {
                winnerCount++;
            }
        }
        
        if (winnerCount == 0) return;
        
        uint256 rewardPerValidator = VALIDATOR_REWARD_POOL.div(winnerCount);
        
        // Distribute rewards to winners
        for (uint256 i = 0; i < voting.voters.length; i++) {
            address validator = voting.voters[i];
            if (voting.votes[validator] == winningChoice) {
                tokenContract.mint(validator, rewardPerValidator);
                
                ValidatorInfo storage info = validatorInfo[validator];
                info.correctVotes = info.correctVotes.add(1);
                info.totalRewardsEarned = info.totalRewardsEarned.add(rewardPerValidator);
                
                emit ValidatorRewardDistributed(reportId, validator, rewardPerValidator);
            }
            
            // Update validation count for all validators
            validatorInfo[validator].reportsValidated = 
                validatorInfo[validator].reportsValidated.add(1);
        }
    }

    function _updateValidatorActivity(address validator) internal {
        validatorInfo[validator].lastActiveTimestamp = block.timestamp;
    }

    function _isValidatorInactive(address validator) internal view returns (bool) {
        if (!validatorInfo[validator].isActive) return false;
        
        return block.timestamp > validatorInfo[validator].lastActiveTimestamp.add(VALIDATOR_INACTIVITY_PERIOD);
    }

    function _checkRateLimit(address user) internal view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        
        // Check daily limit
        if (lastReportDay[user] == today) {
            return dailyReportCount[user] < maxReportsPerDay;
        }
        
        return true; // New day, reset counter
    }

    
    // Admin functions

    function updateConfiguration(
        uint256 _minValidatorsRequired,
        uint256 _consensusThreshold,
        uint256 _maxReportsPerDay
    ) external onlyOwner {
        require(_minValidatorsRequired > 0, "CLIMATE: Invalid min validators");
        require(_consensusThreshold >= 51 && _consensusThreshold <= 100, "CLIMATE: Invalid threshold");
        require(_maxReportsPerDay > 0, "CLIMATE: Invalid max reports");

        emit ConfigurationUpdated("minValidatorsRequired", minValidatorsRequired, _minValidatorsRequired);
        emit ConfigurationUpdated("consensusThreshold", consensusThreshold, _consensusThreshold);
        emit ConfigurationUpdated("maxReportsPerDay", maxReportsPerDay, _maxReportsPerDay);

        minValidatorsRequired = _minValidatorsRequired;
        consensusThreshold = _consensusThreshold;
        maxReportsPerDay = _maxReportsPerDay;
    }

    function emergencyFinalizeReport(uint128 reportId, ReportStatus status) 
        external 
        onlyOwner 
        validReport(reportId) 
    {
        require(status == ReportStatus.Validated || status == ReportStatus.Rejected, "CLIMATE: Invalid status");
        
        Report storage report = reports[reportId];
        require(report.status == ReportStatus.VotingInProgress, "CLIMATE: Not in voting phase");
        
        report.status = status;
        emit EmergencyReportFinalized(reportId, msg.sender);
        emit ReportFinalized(reportId, status, report.validVotes, report.invalidVotes);
    }


    function extendVotingDeadline(uint128 reportId, uint256 additionalHours) 
        external 
        onlyOwner 
        validReport(reportId) 
    {
        require(additionalHours <= 48, "CLIMATE: Max 48 hour extension");
        
        Report storage report = reports[reportId];
        require(report.status == ReportStatus.VotingInProgress, "CLIMATE: Not in voting phase");
        
        report.validationDeadline = report.validationDeadline.add(additionalHours * 1 hours);
    }

    // View functions

    function getReport(uint128 reportId) external view validReport(reportId) returns (
        ReportData memory data,
        address reporter,
        uint256 timestamp,
        ReportStatus status,
        uint256 validationDeadline,
        uint256 validVotes,
        uint256 invalidVotes,
        bool rewardsDistributed
    ) {
        Report storage report = reports[reportId];
        return (
            report.data,
            report.reporter,
            report.timestamp,
            report.status,
            report.validationDeadline,
            report.validVotes,
            report.invalidVotes,
            report.rewardsDistributed
        );
    }

    function getReportVoters(uint128 reportId) external view validReport(reportId) returns (address[] memory) {
        return reportVoting[reportId].voters;
    }

    function getValidatorVote(uint128 reportId, address validator) 
        external 
        view 
        validReport(reportId) 
        returns (bool hasVoted, VoteChoice voteChoice) 
    {
        ReportVoting storage voting = reportVoting[reportId];
        return (voting.hasVoted[validator], voting.votes[validator]);
    }

    function getActiveReports() external view returns (uint128[] memory) {
        uint128[] memory temp = new uint128[](reportCount);
        uint256 count = 0;
        
        for (uint128 i = 1; i <= reportCount; i++) {
            Report storage report = reports[i];
            if (report.status == ReportStatus.VotingInProgress && 
                block.timestamp <= report.validationDeadline) {
                temp[count] = i;
                count++;
            }
        }
        
        uint128[] memory result = new uint128[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        return result;
    }

    function getValidatorStats(address validator) external view returns (
        bool isActive,
        uint256 reportsValidated,
        uint256 correctVotes,
        uint256 totalRewardsEarned,
        uint256 lastActiveTimestamp,
        uint256 accuracyRate
    ) {
        ValidatorInfo storage info = validatorInfo[validator];
        uint256 accuracy = info.reportsValidated > 0 
            ? info.correctVotes.mul(100).div(info.reportsValidated)
            : 0;
            
        return (
            info.isActive,
            info.reportsValidated,
            info.correctVotes,
            info.totalRewardsEarned,
            info.lastActiveTimestamp,
            accuracy
        );
    }

    function getAllValidators() external view returns (address[] memory) {
        return validatorList;
    }

    function getUserDailyReportCount(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        return (lastReportDay[user] == today) ? dailyReportCount[user] : 0;
    }

    function getMinValidatorsForConsensus() external view returns (uint256) {
        return _getMinValidatorsForConsensus();
    }

    function getValidatorRequirements() external pure returns (
        uint256 minCLTBalance,
        uint256 minBDAGStake,
        string memory additionalRequirements
    ) {
        return (
            MIN_CLT_FOR_VALIDATOR,
            MIN_BDAG_STAKE,
            "Must be DAO member and eligible for minting"
        );
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}