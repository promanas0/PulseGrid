// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcAgentPay
 * @dev Autonomous AI Agent Micro-Payment & Session Rule Escrow for Arc L1 (Chain ID: 5042002)
 * Designed for x402 / HTTP 402 AI Agent-to-Agent Micro-Payments with USDC native settlement.
 * Built for PulseGrid Ecosystem on Circle Arc L1.
 */

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ArcAgentPay {
    // Circle USDC Token on Arc Testnet (Standard 6 Decimals)
    address public usdcToken;
    address public contractOwner;

    struct AgentRule {
        uint256 dailyLimit;         // Daily budget in USDC (e.g. 1000000 = 1 USDC)
        uint256 spentToday;         // Amount spent in current 24-hour cycle
        uint256 lastResetTimestamp; // Last cycle timestamp
        bool isActive;              // Whether the agent is authorized
    }

    // Owner => Agent Address => Rule
    mapping(address => mapping(address => AgentRule)) public userAgentRules;

    // Global Statistics
    uint256 public totalAutonomousPayments;
    uint256 public totalVolumeSettled;

    // Events for real-time Web3 Telemetry
    event AgentRegistered(address indexed owner, address indexed agent, uint256 dailyLimit);
    event AgentRevoked(address indexed owner, address indexed agent);
    event AgentPaymentExecuted(
        address indexed owner,
        address indexed agent,
        address indexed recipient,
        uint256 amount,
        string serviceEndpoint,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Only contract owner can call this");
        _;
    }

    constructor(address _usdcToken) {
        contractOwner = msg.sender;
        // Default Arc Testnet Circle USDC address or custom mock
        usdcToken = _usdcToken;
    }

    /**
     * @notice Register and authorize an autonomous AI agent with a daily spend limit
     * @param _agent The wallet address of the AI Agent
     * @param _dailyLimit Max USDC amount allowed per 24 hours (6 decimals: 1 USDC = 1000000)
     */
    function registerAgent(address _agent, uint256 _dailyLimit) external {
        require(_agent != address(0), "Invalid agent address");
        require(_dailyLimit > 0, "Limit must be greater than 0");

        userAgentRules[msg.sender][_agent] = AgentRule({
            dailyLimit: _dailyLimit,
            spentToday: 0,
            lastResetTimestamp: block.timestamp,
            isActive: true
        });

        emit AgentRegistered(msg.sender, _agent, _dailyLimit);
    }

    /**
     * @notice Revoke authorization for an AI agent immediately
     * @param _agent The wallet address of the AI Agent
     */
    function revokeAgent(address _agent) external {
        require(userAgentRules[msg.sender][_agent].isActive, "Agent not active");
        userAgentRules[msg.sender][_agent].isActive = false;

        emit AgentRevoked(msg.sender, _agent);
    }

    /**
     * @notice Execute an autonomous micro-payment (Called directly by the AI Agent without human signature)
     * @param _owner The user who authorized the agent
     * @param _recipient Service provider or API unlocking the data
     * @param _amount Payment amount in USDC (e.g. 1000 = 0.001 USDC)
     * @param _serviceEndpoint URL or Identifier of the unlocked data (e.g. "/api/v1/alpha")
     */
    function executeAgentPay(
        address _owner,
        address _recipient,
        uint256 _amount,
        string calldata _serviceEndpoint
    ) external returns (bool) {
        address agent = msg.sender;
        AgentRule storage rule = userAgentRules[_owner][agent];

        require(rule.isActive, "Agent not authorized by owner");

        // Auto-reset daily spend limit if 24 hours have passed
        if (block.timestamp >= rule.lastResetTimestamp + 1 days) {
            rule.spentToday = 0;
            rule.lastResetTimestamp = block.timestamp;
        }

        // Verify pre-authorized budget rules
        require(rule.spentToday + _amount <= rule.dailyLimit, "Exceeds daily agent spend limit");

        // Update state before external transfer (Reentrancy guard pattern)
        rule.spentToday += _amount;
        totalAutonomousPayments += 1;
        totalVolumeSettled += _amount;

        // Execute transfer from user to recipient
        if (usdcToken != address(0)) {
            bool success = IERC20(usdcToken).transferFrom(_owner, _recipient, _amount);
            require(success, "USDC transfer failed");
        } else {
            // Native USDC payment fallback
            payable(_recipient).transfer(_amount);
        }

        emit AgentPaymentExecuted(
            _owner,
            agent,
            _recipient,
            _amount,
            _serviceEndpoint,
            block.timestamp
        );

        return true;
    }

    /**
     * @notice Get current agent spending status for a user
     */
    function getAgentStatus(address _owner, address _agent) external view returns (
        bool isActive,
        uint256 dailyLimit,
        uint256 remainingBudgetToday
    ) {
        AgentRule memory rule = userAgentRules[_owner][_agent];
        if (!rule.isActive) return (false, 0, 0);

        if (block.timestamp >= rule.lastResetTimestamp + 1 days) {
            return (true, rule.dailyLimit, rule.dailyLimit);
        }

        uint256 remaining = rule.dailyLimit > rule.spentToday ? rule.dailyLimit - rule.spentToday : 0;
        return (true, rule.dailyLimit, remaining);
    }

    /**
     * @notice Update Circle USDC contract address if needed
     */
    function setUsdcToken(address _newUsdcToken) external onlyOwner {
        usdcToken = _newUsdcToken;
    }
}
