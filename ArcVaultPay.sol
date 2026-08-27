// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcVaultPay
 * @dev Autonomous AI Agent Vault with real on-chain Deposit, Autonomous Pay, and Instant Withdraw.
 * Target Network: Arc Testnet (Chain ID: 5042002)
 * USDC Token: 0x3600000000000000000000000000000000000000 (Circle ERC-20)
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ArcVaultPay {
    IERC20 public immutable usdc;
    address public contractOwner;

    // User Address => Deposited Vault Balance (USDC 6 decimals: 1 USDC = 1,000,000)
    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public dailySpendLimits;
    mapping(address => uint256) public spentToday;
    mapping(address => uint256) public lastResetTimestamp;

    // Global Stats
    uint256 public totalVolumeSettled;
    uint256 public totalAutonomousQueries;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event AutonomousPaySettled(address indexed user, address indexed serviceProvider, uint256 fee, string endpoint);

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Only owner can call this");
        _;
    }

    constructor(address _usdcToken) {
        contractOwner = msg.sender;
        usdc = IERC20(_usdcToken);
    }

    /**
     * @notice Deposit USDC into private Agent Vault
     * @param _amount Amount in USDC (6 decimals, e.g. 100000 = 0.10 USDC)
     */
    function deposit(uint256 _amount) external {
        require(_amount > 0, "Deposit amount must be > 0");
        require(usdc.transferFrom(msg.sender, address(this), _amount), "USDC transferFrom failed");
        userBalances[msg.sender] += _amount;
        emit Deposited(msg.sender, _amount);
    }

    /**
     * @notice Withdraw unspent USDC from Vault back to user's wallet
     * @param _amount Amount in USDC to withdraw
     */
    function withdraw(uint256 _amount) external {
        require(_amount > 0, "Withdraw amount must be > 0");
        require(userBalances[msg.sender] >= _amount, "Insufficient vault balance");
        userBalances[msg.sender] -= _amount;
        require(usdc.transfer(msg.sender, _amount), "USDC transfer failed");
        emit Withdrawn(msg.sender, _amount);
    }

    /**
     * @notice Deduct micro-fee for AI Agent queries without user signature
     * @param _user The user whose vault balance will be deducted
     * @param _serviceProvider The recipient of the micro-fee (e.g. AI engine or treasury)
     * @param _fee Fee amount in USDC (e.g. 1000 = 0.001 USDC)
     * @param _endpoint Identifier of the query (e.g. "/pro-ai/query")
     */
    function executeAutoPay(
        address _user,
        address _serviceProvider,
        uint256 _fee,
        string calldata _endpoint
    ) external returns (bool) {
        require(userBalances[_user] >= _fee, "Insufficient vault balance");

        // Check and reset 24h spend cycle
        if (block.timestamp >= lastResetTimestamp[_user] + 1 days) {
            spentToday[_user] = 0;
            lastResetTimestamp[_user] = block.timestamp;
        }

        uint256 limit = dailySpendLimits[_user] == 0 ? 1000000 : dailySpendLimits[_user]; // default 1.00 USDC
        require(spentToday[_user] + _fee <= limit, "Exceeds daily spend limit");

        userBalances[_user] -= _fee;
        spentToday[_user] += _fee;
        totalVolumeSettled += _fee;
        totalAutonomousQueries += 1;

        if (_serviceProvider != address(0) && _serviceProvider != address(this)) {
            require(usdc.transfer(_serviceProvider, _fee), "Fee settlement failed");
        }

        emit AutonomousPaySettled(_user, _serviceProvider, _fee, _endpoint);
        return true;
    }

    /**
     * @notice Set personal daily spend limit
     */
    function setDailyLimit(uint256 _newLimit) external {
        require(_newLimit > 0, "Limit must be > 0");
        dailySpendLimits[msg.sender] = _newLimit;
    }

    /**
     * @notice Get user vault details
     */
    function getUserVault(address _user) external view returns (
        uint256 balance,
        uint256 dailyLimit,
        uint256 spent,
        uint256 remaining
    ) {
        balance = userBalances[_user];
        dailyLimit = dailySpendLimits[_user] == 0 ? 1000000 : dailySpendLimits[_user];
        if (block.timestamp >= lastResetTimestamp[_user] + 1 days) {
            spent = 0;
        } else {
            spent = spentToday[_user];
        }
        remaining = dailyLimit > spent ? dailyLimit - spent : 0;
    }
}
