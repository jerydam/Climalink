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

    struct ReportInput {
        string weather;
        int128 temperature;
        uint128 humidity;
        string location;
        int128 longitude;
        int128 latitude;
    }

    struct Report {
        string location;
        int128 longitude;
        int128 latitude;
        int128 temperature;
        uint128 humidity;
        string weather;
        address reporter;
        uint256 timestamp;
        ReportStatus status;
        uint256 validationDeadline;
        uint256 validVotes;
        uint256 invalidVotes;
        uint256 totalValidators;
        mapping(address => bool) hasVoted;
        mapping(address => VoteChoice) votes;
    }

    struct ReportView {
        string location;
        int128 longitude;
        int128 latitude;
        int128 temperature;
        uint128 humidity;
        string weather;
        address reporter;
        uint256 timestamp;
        ReportStatus status;
        uint256 validationDeadline;
        uint256 validVotes;
        uint256 invalidVotes;
        uint256 totalValidators;
    }

    mapping(uint128 => Report) public reports;
    uint128 public reportCount;
    uint256 public constant VALIDATION_PERIOD = 24 hours;
    uint256 public constant REPORT_REWARD = 20 * 10**18; // 20 CLT tokens
    uint256 public constant MIN_CLT_FOR_VALIDATOR = 1000 * 10**18; // 1000 CLT
    uint256 public constant MIN_BDAG_STAKE = 100 * 10**18; // 100 BDAG
    
    IClimaLinkToken public immutable tokenContract;
    IClimaLinkDao public immutable daoContract;
    mapping(address => Role) public userRoles;
    mapping(address => bool) public validators;
    uint256 public totalValidators;

    event ClimateEvent(uint128 indexed index, string message);
    event ReportValidationStarted(uint128 indexed index, uint256 deadline);
    event ReportVoteCast(uint128 indexed index, address indexed validator, VoteChoice vote);
    event ReportValidated(uint128 indexed index, uint256 validVotes, uint256 invalidVotes);
    event ReportRejected(uint128 indexed index, uint256 validVotes, uint256 invalidVotes);
    event RoleAssigned(address indexed user, Role role);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event RoleUpgraded(address indexed user, Role oldRole, Role newRole);
    event AutoUpgradeAttempted(address indexed user, bool success);

    modifier validReportData(ReportInput memory input) {
        require(bytes(input.weather).length > 0 && bytes(input.weather).length <= 50, "Invalid weather description");
        require(input.temperature >= -100 && input.temperature <= 100, "Invalid temperature range");
        require(input.humidity <= 100, "Invalid humidity range");
        require(bytes(input.location).length > 0 && bytes(input.location).length <= 100, "Invalid location");
        require(input.longitude >= -180000 && input.longitude <= 180000, "Invalid longitude");
        require(input.latitude >= -90000 && input.latitude <= 90000, "Invalid latitude");
        _;
    }

    modifier onlyReporter() {
        require(userRoles[msg.sender] == Role.Reporter, "Only reporters can perform this action");
        _;
    }

    modifier onlyValidator() {
        require(userRoles[msg.sender] == Role.Validator && validators[msg.sender], "Only active validators can perform this action");
        _;
    }

    modifier validReport(uint128 index) {
        require(index > 0 && index <= reportCount, "Invalid report index");
        _;
    }

    constructor(address _tokenContract, address _daoContract) Ownable(msg.sender) {
        require(_tokenContract != address(0), "Invalid token contract address");
        require(_daoContract != address(0), "Invalid DAO contract address");
        tokenContract = IClimaLinkToken(_tokenContract);
        daoContract = IClimaLinkDao(_daoContract);
    }

    /**
     * @dev Assign role based on DAO membership - automatic role assignment
     * New users get Reporter role, DAO members get Validator role
     * Also handles upgrades for existing users
     */
    function joinAsReporterOrValidator() external whenNotPaused returns (Role) {
        // If user already has a role, check if they can be upgraded
        if (userRoles[msg.sender] == Role.Reporter) {
            // Try to upgrade to validator if they're now a DAO member
            if (daoContract.isMember(msg.sender) &&
                tokenContract.getBalanceOfUser(msg.sender) >= MIN_CLT_FOR_VALIDATOR &&
                tokenContract.isEligibleForMinting(msg.sender) &&
                tokenContract.getStakedAmount(msg.sender) >= MIN_BDAG_STAKE) {
                
                _upgradeToValidator(msg.sender);
                return Role.Validator;
            }
            // Still a reporter, couldn't upgrade or not DAO member
            return Role.Reporter;
        }
        
        // If already a validator, no change needed
        if (userRoles[msg.sender] == Role.Validator) {
            return Role.Validator;
        }
        
        // New user with no role
        require(userRoles[msg.sender] == Role.None, "User role state error");
        
        Role newRole;
        
        // Check if user is a DAO member
        if (daoContract.isMember(msg.sender)) {
            // DAO members automatically become validators if they meet requirements
            if (tokenContract.getBalanceOfUser(msg.sender) >= MIN_CLT_FOR_VALIDATOR &&
                tokenContract.isEligibleForMinting(msg.sender) &&
                tokenContract.getStakedAmount(msg.sender) >= MIN_BDAG_STAKE) {
                
                newRole = Role.Validator;
                validators[msg.sender] = true;
                totalValidators = totalValidators.add(1);
                emit ValidatorAdded(msg.sender);
            } else {
                // DAO member but doesn't meet validator requirements, becomes reporter
                newRole = Role.Reporter;
            }
        } else {
            // Non-DAO members become reporters
            newRole = Role.Reporter;
        }
        
        userRoles[msg.sender] = newRole;
        emit RoleAssigned(msg.sender, newRole);
        return newRole;
    }

    /**
     * @dev Internal function to upgrade from Reporter to Validator
     * Requires minimum CLT balance and BDAG stake
     */
    function _upgradeToValidator(address user) internal returns (bool) {
        require(userRoles[user] == Role.Reporter, "Must be a reporter to upgrade");
        require(daoContract.isMember(user), "Must be a DAO member to become validator");
        require(tokenContract.getBalanceOfUser(user) >= MIN_CLT_FOR_VALIDATOR, "Need minimum 1000 CLT for validator role");
        require(tokenContract.isEligibleForMinting(user), "Must stake minimum BDAG for validator role");
        require(tokenContract.getStakedAmount(user) >= MIN_BDAG_STAKE, "Must stake minimum 100 BDAG for validator role");
        
        Role oldRole = userRoles[user];
        userRoles[user] = Role.Validator;
        validators[user] = true;
        totalValidators = totalValidators.add(1);
        
        emit RoleUpgraded(user, oldRole, Role.Validator);
        emit ValidatorAdded(user);
        return true;
    }

    /**
     * @dev Check and upgrade role if user meets validator requirements
     * Can be called by anyone for themselves or by DAO contract for members
     */
    function checkAndUpgradeRole(address user) external whenNotPaused returns (bool) {
        require(user != address(0), "Invalid address");
        
        // If called by DAO contract, allow for any user
        // If called by user, only allow for themselves
        if (msg.sender != address(daoContract)) {
            require(msg.sender == user, "Can only check own role upgrade");
        }
        
        // Check if user is reporter and DAO member, then upgrade
        if (userRoles[user] == Role.Reporter && daoContract.isMember(user)) {
            if (tokenContract.getBalanceOfUser(user) >= MIN_CLT_FOR_VALIDATOR &&
                tokenContract.isEligibleForMinting(user) &&
                tokenContract.getStakedAmount(user) >= MIN_BDAG_STAKE) {
                
                _upgradeToValidator(user);
                emit AutoUpgradeAttempted(user, true);
                return true;
            }
        }
        emit AutoUpgradeAttempted(user, false);
        return false;
    }

    /**
     * @dev Notify when someone joins DAO - automatically upgrade if they're a reporter
     * Called by DAO contract when someone joins
     */
    function notifyDaoMembership(address newMember) external returns (bool) {
        require(msg.sender == address(daoContract), "Only DAO contract can notify membership");
        require(newMember != address(0), "Invalid address");
        
        // If they're already a reporter, try to upgrade them to validator
        if (userRoles[newMember] == Role.Reporter) {
            if (tokenContract.getBalanceOfUser(newMember) >= MIN_CLT_FOR_VALIDATOR &&
                tokenContract.isEligibleForMinting(newMember) &&
                tokenContract.getStakedAmount(newMember) >= MIN_BDAG_STAKE) {
                
                _upgradeToValidator(newMember);
                emit AutoUpgradeAttempted(newMember, true);
                return true;
            }
        }
        emit AutoUpgradeAttempted(newMember, false);
        return false;
    }

    /**
     * @dev Create a climate report (reporters only)
     */
    function createClimateReport(ReportInput memory input)
        external
        nonReentrant
        whenNotPaused
        validReportData(input)
        onlyReporter
        returns (uint128)
    {
        require(totalValidators > 0, "No validators available for validation");
        
        uint128 index = reportCount + 1;
        reportCount = index;

        Report storage newReport = reports[index];
        newReport.weather = input.weather;
        newReport.temperature = input.temperature;
        newReport.humidity = input.humidity;
        newReport.location = input.location;
        newReport.longitude = input.longitude;
        newReport.latitude = input.latitude;
        newReport.reporter = msg.sender;
        newReport.timestamp = block.timestamp;
        newReport.status = ReportStatus.VotingInProgress;
        newReport.validationDeadline = block.timestamp.add(VALIDATION_PERIOD);
        newReport.totalValidators = totalValidators;

        emit ClimateEvent(index, "New Climate Report Added - Voting Started");
        emit ReportValidationStarted(index, newReport.validationDeadline);
        return index;
    }

    /**
     * @dev Vote on report validation (validators only)
     */
    function voteOnReport(uint128 index, VoteChoice vote) 
        external 
        whenNotPaused 
        onlyValidator 
        validReport(index) 
        returns (bool) 
    {
        Report storage report = reports[index];
        require(report.status == ReportStatus.VotingInProgress, "Report not in voting phase");
        require(block.timestamp <= report.validationDeadline, "Voting period ended");
        require(!report.hasVoted[msg.sender], "Already voted on this report");
        require(report.reporter != msg.sender, "Cannot vote on own report");

        report.hasVoted[msg.sender] = true;
        report.votes[msg.sender] = vote;

        if (vote == VoteChoice.Valid) {
            report.validVotes = report.validVotes.add(1);
        } else {
            report.invalidVotes = report.invalidVotes.add(1);
        }

        emit ReportVoteCast(index, msg.sender, vote);

        // Check if we can finalize early (if >51% of validators have voted with same choice)
        uint256 requiredMajority = report.totalValidators.mul(51).div(100).add(1); // >51%

        if (report.validVotes >= requiredMajority) {
            _finalizeReport(index, true);
        } else if (report.invalidVotes >= requiredMajority) {
            _finalizeReport(index, false);
        }

        return true;
    }

    /**
     * @dev Finalize report after voting deadline
     */
    function finalizeReport(uint128 index) 
        external 
        whenNotPaused 
        validReport(index) 
        returns (bool) 
    {
        Report storage report = reports[index];
        require(report.status == ReportStatus.VotingInProgress, "Report not in voting phase");
        require(block.timestamp > report.validationDeadline, "Voting period not ended");

        // Determine result based on majority vote
        bool isValid = report.validVotes > report.invalidVotes;
        _finalizeReport(index, isValid);
        return true;
    }

    /**
     * @dev Internal function to finalize report
     */
    function _finalizeReport(uint128 index, bool isValid) internal {
        Report storage report = reports[index];
        
        if (isValid) {
            report.status = ReportStatus.Validated;
            // Mint reward to reporter
            tokenContract.mint(report.reporter, REPORT_REWARD);
            emit ReportValidated(index, report.validVotes, report.invalidVotes);
        } else {
            report.status = ReportStatus.Rejected;
            emit ReportRejected(index, report.validVotes, report.invalidVotes);
        }
    }

    /**
     * @dev Get report details including voting information
     */
    function getClimateReport(uint128 index) external view validReport(index) returns (ReportView memory) {
        Report storage report = reports[index];
        return ReportView({
            location: report.location,
            longitude: report.longitude,
            latitude: report.latitude,
            temperature: report.temperature,
            humidity: report.humidity,
            weather: report.weather,
            reporter: report.reporter,
            timestamp: report.timestamp,
            status: report.status,
            validationDeadline: report.validationDeadline,
            validVotes: report.validVotes,
            invalidVotes: report.invalidVotes,
            totalValidators: report.totalValidators
        });
    }

    /**
     * @dev Get voting information for a specific report and validator
     */
    function getValidatorVote(uint128 index, address validator) 
        external 
        view 
        validReport(index) 
        returns (bool hasVoted, VoteChoice vote) 
    {
        Report storage report = reports[index];
        return (report.hasVoted[validator], report.votes[validator]);
    }

    /**
     * @dev Get all reports that are currently in voting phase
     */
    function getActiveVotingReports() external view returns (uint128[] memory) {
        uint128[] memory activeReports = new uint128[](reportCount);
        uint256 count = 0;
        
        for (uint128 i = 1; i <= reportCount; i++) {
            if (reports[i].status == ReportStatus.VotingInProgress && 
                block.timestamp <= reports[i].validationDeadline) {
                activeReports[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint128[] memory result = new uint128[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeReports[i];
        }
        return result;
    }

    /**
     * @dev Get total number of active validators
     */
    function getTotalValidators() external view returns (uint256) {
        return totalValidators;
    }

    /**
     * @dev Check if address is an active validator
     */
    function isValidator(address user) external view returns (bool) {
        return validators[user] && userRoles[user] == Role.Validator;
    }

    /**
     * @dev Admin function to remove validator (in case they unstake or lose DAO membership)
     */
    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Not an active validator");
        validators[validator] = false;
        userRoles[validator] = Role.None;
        totalValidators = totalValidators.sub(1);
        emit ValidatorRemoved(validator);
    }

    /**
     * @dev Emergency function to extend voting deadline
     */
    function extendVotingDeadline(uint128 index, uint256 additionalHours) external onlyOwner validReport(index) {
        require(additionalHours <= 48, "Cannot extend more than 48 hours");
        Report storage report = reports[index];
        require(report.status == ReportStatus.VotingInProgress, "Report not in voting phase");
        
        report.validationDeadline = report.validationDeadline.add(additionalHours * 1 hours);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}