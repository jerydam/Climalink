// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IBDAG {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IClimaLinkDao {
    function notifyUnstake(address member) external;
}

contract ClimaLinkToken is ReentrancyGuard, Pausable, Ownable(msg.sender) {
    using SafeMath for uint256;
    
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    uint256 public maxSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public stakedBDAG;
    mapping(address => uint256) public stakingTimestamp;
    mapping(address => bool) public authorizedMinters;
    
    IBDAG public bdagToken;
    IClimaLinkDao public daoContract;
    uint256 public constant BDAG_STAKE_AMOUNT = 100 * 10**18; // 100 BDAG tokens
    uint256 public constant STAKE_LOCK_PERIOD = 60 days;
    uint256 public constant MINT_AMOUNT = 1000 * 10**18; // 1000 CLT tokens
    
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event Stake(address indexed user, uint256 amount);
    event Unstake(address indexed user, uint256 amount);
    event Blacklisted(address indexed account, bool status);
    event AuthorizedMinter(address indexed account, bool status);
    
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }
    
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    modifier validAddress(address account) {
        require(account != address(0), "Invalid address");
        _;
    }
    
    constructor(address _bdagToken, address _daoContract) {
        require(_bdagToken != address(0), "Invalid BDAG token address");
        require(_daoContract != address(0), "Invalid DAO contract address");
        
        name = "ClimaLinkToken";
        symbol = "CLT";
        decimals = 18;
        maxSupply = 1000000000 * 10**18; // 1 billion tokens max supply
        bdagToken = IBDAG(_bdagToken);
        daoContract = IClimaLinkDao(_daoContract);
        
        // Set initial authorized minter
        authorizedMinters[msg.sender] = true;
    }
    
    /**
     * @dev Stake BDAG tokens to become eligible for CLT minting and automatically mint CLT
     */
    function stakeBDAG() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(stakedBDAG[msg.sender] == 0, "Already staked");
        require(bdagToken.balanceOf(msg.sender) >= BDAG_STAKE_AMOUNT, "Insufficient BDAG balance");
        
        require(bdagToken.transferFrom(msg.sender, address(this), BDAG_STAKE_AMOUNT), "BDAG transfer failed");
        
        stakedBDAG[msg.sender] = BDAG_STAKE_AMOUNT;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        // Automatically mint CLT tokens
        require(totalSupply.add(MINT_AMOUNT) <= maxSupply, "Max supply exceeded");
        totalSupply = totalSupply.add(MINT_AMOUNT);
        balanceOf[msg.sender] = balanceOf[msg.sender].add(MINT_AMOUNT);
        
        emit Stake(msg.sender, BDAG_STAKE_AMOUNT);
        emit Mint(msg.sender, MINT_AMOUNT);
        emit Transfer(address(0), msg.sender, MINT_AMOUNT);
    }
    
    /**
     * @dev Unstake BDAG tokens after lock period and notify DAO
     */
    function unstakeBDAG() external nonReentrant whenNotPaused {
        require(stakedBDAG[msg.sender] > 0, "No tokens staked");
        require(block.timestamp >= stakingTimestamp[msg.sender] + STAKE_LOCK_PERIOD, "Tokens still locked");
        
        uint256 amount = stakedBDAG[msg.sender];
        stakedBDAG[msg.sender] = 0;
        stakingTimestamp[msg.sender] = 0;
        
        require(bdagToken.transfer(msg.sender, amount), "BDAG transfer failed");
        
        // Notify DAO contract of unstake
        daoContract.notifyUnstake(msg.sender);
        
        emit Unstake(msg.sender, amount);
    }
    
    /**
     * @dev Mint CLT tokens (requires BDAG staking)
     */
    function mint(address to, uint256 amount) external onlyAuthorizedMinter nonReentrant whenNotPaused validAddress(to) notBlacklisted(to) {
        require(stakedBDAG[to] >= BDAG_STAKE_AMOUNT, "Must stake BDAG tokens first");
        require(totalSupply.add(amount) <= maxSupply, "Max supply exceeded");
        
        totalSupply = totalSupply.add(amount);
        balanceOf[to] = balanceOf[to].add(amount);
        
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }
    
    /**
     * @dev Transfer tokens with security checks
     */
    function transfer(address to, uint256 amount) external whenNotPaused validAddress(to) notBlacklisted(msg.sender) notBlacklisted(to) returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(amount);
        balanceOf[to] = balanceOf[to].add(amount);
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Approve spender with security checks
     */
    function approve(address spender, uint256 amount) external whenNotPaused validAddress(spender) notBlacklisted(msg.sender) notBlacklisted(spender) returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfer from with security checks
     */
    function transferFrom(address from, address to, uint256 amount) external whenNotPaused validAddress(from) validAddress(to) notBlacklisted(from) notBlacklisted(to) returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        require(balanceOf[from] >= amount, "Insufficient balance");
        
        allowance[from][msg.sender] = allowance[from][msg.sender].sub(amount);
        balanceOf[from] = balanceOf[from].sub(amount);
        balanceOf[to] = balanceOf[to].add(amount);
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external whenNotPaused {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(amount);
        totalSupply = totalSupply.sub(amount);
        
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }
    
    // Admin functions
    function setBlacklisted(address account, bool status) external onlyOwner validAddress(account) {
        blacklisted[account] = status;
        emit Blacklisted(account, status);
    }
    
    function setAuthorizedMinter(address account, bool status) external onlyOwner validAddress(account) {
        authorizedMinters[account] = status;
        emit AuthorizedMinter(account, status);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdrawBDAG() external onlyOwner {
        uint256 balance = bdagToken.balanceOf(address(this));
        require(balance > 0, "No BDAG to withdraw");
        require(bdagToken.transfer(owner(), balance), "Transfer failed");
    }
    
    // View functions
    function getBalanceOfUser(address user) external view returns (uint256) {
        return balanceOf[user];
    }
    
    function getStakedAmount(address user) external view returns (uint256) {
        return stakedBDAG[user];
    }
    
    function getUnlockTime(address user) external view returns (uint256) {
        if (stakingTimestamp[user] == 0) return 0;
        return stakingTimestamp[user] + STAKE_LOCK_PERIOD;
    }
    
    function isEligibleForMinting(address user) external view returns (bool) {
        return stakedBDAG[user] >= BDAG_STAKE_AMOUNT;
    }
}