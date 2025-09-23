// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IClimaLinkToken {
    function getBalanceOfUser(address user) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function isEligibleForMinting(address user) external view returns (bool);
    function getStakedAmount(address user) external view returns (uint256);
}

contract ClimaLinkDao is ReentrancyGuard, Pausable, Ownable(msg.sender) {
    using SafeMath for uint256;
    
    enum ProposalStatus { Active, Executed, Rejected, Expired }
    enum VoteType { Against, For, Abstain }
    
    struct Proposal {
        uint128 proposalId;
        string name;
        string description;
        uint128 deadline;
        address proposer;
        ProposalStatus status;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 totalVotes;
        bool executed;
        uint256 quorumRequired;
        uint256 createdAt;
    }
    
    struct Member {
        uint128 memberId;
        address memberAddress;
        uint256 joinedAt;
        uint256 votingPower;
        bool active;
    }
    
    struct Vote {
        bool hasVoted;
        VoteType vote;
        uint256 timestamp;
        uint256 weight;
    }
    
    mapping(uint128 => Proposal) public proposals;
    mapping(uint128 => Member) public memberList;
    mapping(address => bool) public isMember;
    mapping(address => uint128) public memberIds;
    mapping(uint128 => mapping(address => Vote)) public votes;
    mapping(address => bool) public blacklisted;
    
    uint128 public proposalCount;
    uint128 public membersCount;
    uint256 public constant MEMBERSHIP_FEE = 1000 * 10**18; // 1000 CLT tokens
    uint256 public constant MIN_PROPOSAL_DURATION = 1 days;
    uint256 public constant MAX_PROPOSAL_DURATION = 30 days;
    uint256 public constant QUORUM_PERCENTAGE = 51; // 51% quorum required
    uint256 public constant VOTING_DELAY = 1 hours; // Delay before voting starts
    uint256 public constant MINIMUM_STAKE = 100 * 10**18; // 100 BDAG tokens
    
    IClimaLinkToken public tokenContract;
    
    event MemberJoined(address indexed member, uint128 memberId);
    event MemberLeft(address indexed member);
    event ProposalCreated(uint128 indexed proposalId, address indexed proposer, string name);
    event VoteCast(uint128 indexed proposalId, address indexed voter, VoteType vote, uint256 weight);
    event ProposalExecuted(uint128 indexed proposalId);
    event ProposalExpired(uint128 indexed proposalId);
    event MemberBlacklisted(address indexed member, bool status);
    event MemberRemovedOnUnstake(address indexed member);
    event TokenContractUpdated(address indexed newTokenContract);
    
    modifier onlyMember() {
        require(isMember[msg.sender] && !blacklisted[msg.sender], "Not an active member");
        _;
    }
    
    modifier validProposal(uint128 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        require(proposals[proposalId].status == ProposalStatus.Active, "Proposal not active");
        _;
    }
    
    modifier notBlacklisted() {
        require(!blacklisted[msg.sender], "Address is blacklisted");
        _;
    }
    
    constructor(address _tokenContract) {
        require(_tokenContract != address(0), "Invalid token contract address");
        tokenContract = IClimaLinkToken(_tokenContract);
    }
    
    /**
     * @dev Set the token contract address (only owner)
     */
    function setTokenContract(address _tokenContract) external onlyOwner {
        require(_tokenContract != address(0), "Invalid token contract address");
        require(address(tokenContract) != _tokenContract, "Token contract already set to this address");
        tokenContract = IClimaLinkToken(_tokenContract);
        emit TokenContractUpdated(_tokenContract);
    }
    
    /**
     * @dev Join the DAO by paying membership fee
     */
    function joinDao() external nonReentrant whenNotPaused notBlacklisted returns (uint128) {
        require(!isMember[msg.sender], "Already a member");
        require(tokenContract.isEligibleForMinting(msg.sender), "Must stake BDAG tokens first");
        require(tokenContract.getStakedAmount(msg.sender) >= MINIMUM_STAKE, "Must stake minimum 100 BDAG");
        require(tokenContract.getBalanceOfUser(msg.sender) >= MEMBERSHIP_FEE, "Must have minimum 1000 CLT");
        
        // Transfer membership fee
        require(tokenContract.transfer(address(this), MEMBERSHIP_FEE), "Membership fee transfer failed");
        
        uint128 id = membersCount + 1;
        Member memory newMember = Member({
            memberId: id,
            memberAddress: msg.sender,
            joinedAt: block.timestamp,
            votingPower: 1,
            active: true
        });
        
        memberList[id] = newMember;
        memberIds[msg.sender] = id;
        isMember[msg.sender] = true;
        membersCount = id;
        
        emit MemberJoined(msg.sender, id);
        return id;
    }
    
    /**
     * @dev Leave the DAO (forfeit membership fee)
     */
    function leaveDao() external onlyMember {
        _removeMember(msg.sender);
    }
    
    /**
     * @dev Remove member from DAO (internal function)
     */
    function _removeMember(address member) internal {
        uint128 memberId = memberIds[member];
        memberList[memberId].active = false;
        isMember[member] = false;
        emit MemberRemovedOnUnstake(member);
    }
    
    /**
     * @dev Called by token contract when unstaking
     */
    function notifyUnstake(address member) external {
        require(msg.sender == address(tokenContract), "Only token contract can call");
        if (isMember[member]) {
            _removeMember(member);
        }
    }
    
    /**
     * @dev Get list of active members
     */
    function getMemberList() external view returns (Member[] memory) {
        uint256 activeCount = 0;
        
        // Count active members
        for (uint128 i = 1; i <= membersCount; i++) {
            if (memberList[i].active) {
                activeCount++;
            }
        }
        
        Member[] memory activeMembers = new Member[](activeCount);
        uint256 index = 0;
        
        for (uint128 i = 1; i <= membersCount; i++) {
            if (memberList[i].active) {
                activeMembers[index] = memberList[i];
                index++;
            }
        }
        
        return activeMembers;
    }
    
    /**
     * @dev View all proposals
     */
    function viewProposals() external view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalCount);
        
        for (uint128 i = 1; i <= proposalCount; i++) {
            allProposals[i - 1] = proposals[i];
        }
        
        return allProposals;
    }
    
    /**
     * @dev Create a new proposal
     */
    function createProposal(
        string memory title,
        string memory desc,
        uint128 duration
    ) external onlyMember returns (uint128) {
        require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title length");
        require(bytes(desc).length > 0 && bytes(desc).length <= 1000, "Invalid description length");
        require(duration >= MIN_PROPOSAL_DURATION && duration <= MAX_PROPOSAL_DURATION, "Invalid duration");
        
        uint128 id = proposalCount + 1;
        uint128 deadline = uint128(block.timestamp + duration);
        uint256 quorum = (getActiveMembers() * QUORUM_PERCENTAGE) / 100;
        
        Proposal memory newProposal = Proposal({
            proposalId: id,
            name: title,
            description: desc,
            deadline: deadline,
            proposer: msg.sender,
            status: ProposalStatus.Active,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            totalVotes: 0,
            executed: false,
            quorumRequired: quorum,
            createdAt: block.timestamp
        });
        
        proposals[id] = newProposal;
        proposalCount = id;
        
        emit ProposalCreated(id, msg.sender, title);
        return id;
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(uint128 proposalId, VoteType voteType) external onlyMember validProposal(proposalId) returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp <= proposal.deadline, "Voting period ended");
        require(block.timestamp >= proposal.createdAt + VOTING_DELAY, "Voting not started yet");
        require(!votes[proposalId][msg.sender].hasVoted, "Already voted");
        
        uint256 weight = memberList[memberIds[msg.sender]].votingPower;
        
        votes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            vote: voteType,
            timestamp: block.timestamp,
            weight: weight
        });
        
        if (voteType == VoteType.For) {
            proposal.forVotes += weight;
        } else if (voteType == VoteType.Against) {
            proposal.againstVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }
        
        proposal.totalVotes += weight;
        
        emit VoteCast(proposalId, msg.sender, voteType, weight);
        return true;
    }
    
    /**
     * @dev Execute a proposal if it meets requirements
     */
    function executeProposal(uint128 proposalId) external validProposal(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.deadline, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.totalVotes >= proposal.quorumRequired, "Quorum not reached");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.status = ProposalStatus.Executed;
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Mark expired proposals
     */
    function markProposalExpired(uint128 proposalId) external {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp > proposal.deadline, "Proposal not expired yet");
        
        if (proposal.totalVotes < proposal.quorumRequired || proposal.forVotes <= proposal.againstVotes) {
            proposal.status = ProposalStatus.Expired;
            emit ProposalExpired(proposalId);
        }
    }
    
    /**
     * @dev Get vote count for a proposal
     */
    function getProposalVotes(uint128 proposalId) external view returns (uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, uint256 totalVotes) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        Proposal memory proposal = proposals[proposalId];
        return (proposal.forVotes, proposal.againstVotes, proposal.abstainVotes, proposal.totalVotes);
    }
    
    /**
     * @dev Get user's vote on a proposal
     */
    function getUserVote(uint128 proposalId, address user) external view returns (bool hasVoted, VoteType voteChoice, uint256 timestamp) {
        Vote memory userVote = votes[proposalId][user];
        return (userVote.hasVoted, userVote.vote, userVote.timestamp);
    }
    
    /**
     * @dev Get active members count
     */
    function getActiveMembers() public view returns (uint256) {
        uint256 count = 0;
        for (uint128 i = 1; i <= membersCount; i++) {
            if (memberList[i].active) {
                count++;
            }
        }
        return count;
    }
    
    // Admin functions
    function setMemberBlacklist(address member, bool status) external onlyOwner {
        require(member != address(0), "Invalid address");
        blacklisted[member] = status;
        
        if (status && isMember[member]) {
            _removeMember(member);
        }
        
        emit MemberBlacklisted(member, status);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = tokenContract.getBalanceOfUser(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(tokenContract.transfer(owner(), balance), "Transfer failed");
    }
    
    // Legacy compatibility function
    function viewVotes(uint128 index) external view returns (uint128) {
        require(index > 0 && index <= proposalCount, "Invalid proposal ID");
        return uint128(proposals[index].totalVotes);
    }
}