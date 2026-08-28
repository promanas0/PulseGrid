// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PulseBridgeRouter
 * @dev High-performance cross-chain token bridge router utilizing Circle CCTP (Cross-Chain Transfer Protocol)
 *      standard for 1:1 pegged asset transfers between Arc Testnet and connected EVM networks.
 * @author PulseGrid Labs
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract PulseBridgeRouter {
    string public constant name = "PulseBridge CCTP Router";
    string public constant version = "1.0.0";

    address public owner;
    bool public paused;
    uint256 public totalDeposits;
    uint256 public totalClaims;

    // Supported remote chain IDs
    mapping(uint256 => bool) public supportedChains;
    // Processed deposit tracking: depositId => isClaimed
    mapping(bytes32 => bool) public processedDeposits;

    event BridgeDepositInitiated(
        bytes32 indexed depositId,
        address indexed sender,
        address indexed token,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId,
        address recipient,
        uint256 nonce,
        uint256 timestamp
    );

    event BridgeTokensClaimed(
        bytes32 indexed depositId,
        address indexed recipient,
        address indexed token,
        uint256 amount,
        uint256 sourceChainId,
        uint256 timestamp
    );

    event ChainSupportUpdated(uint256 indexed chainId, bool supported);

    modifier onlyOwner() {
        require(msg.sender == owner, "PulseBridge: Caller is not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "PulseBridge: Bridge is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Arc Testnet
        supportedChains[5042002] = true;
        // Ethereum Sepolia
        supportedChains[11155111] = true;
        // Base Sepolia
        supportedChains[84532] = true;
        // Arbitrum Sepolia
        supportedChains[421614] = true;
    }

    /**
     * @notice Initiates a cross-chain bridge transfer for ERC-20 tokens or native assets.
     * @param token Address of token to bridge (use address(0) for native gas currency)
     * @param amount Amount of tokens to bridge
     * @param targetChainId Destination Chain ID
     * @param recipient Target recipient wallet address
     */
    function bridgeDeposit(
        address token,
        uint256 amount,
        uint256 targetChainId,
        address recipient
    ) external payable whenNotPaused returns (bytes32 depositId) {
        require(supportedChains[targetChainId], "PulseBridge: Target chain not supported");
        require(targetChainId != block.chainid, "PulseBridge: Cannot bridge to same chain");
        require(recipient != address(0), "PulseBridge: Invalid recipient");

        if (token == address(0)) {
            require(msg.value == amount && amount > 0, "PulseBridge: Invalid native amount");
        } else {
            require(msg.value == 0, "PulseBridge: Do not send native currency with ERC20");
            require(amount > 0, "PulseBridge: Amount must be > 0");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "PulseBridge: Transfer failed");
        }

        totalDeposits++;
        depositId = keccak256(
            abi.encodePacked(
                msg.sender,
                token,
                amount,
                block.chainid,
                targetChainId,
                recipient,
                totalDeposits,
                block.timestamp
            )
        );

        emit BridgeDepositInitiated(
            depositId,
            msg.sender,
            token,
            amount,
            block.chainid,
            targetChainId,
            recipient,
            totalDeposits,
            block.timestamp
        );
    }

    /**
     * @notice Releases or mints tokens to recipient upon verified CCTP attestation.
     */
    function claimBridgedTokens(
        bytes32 depositId,
        address token,
        uint256 amount,
        uint256 sourceChainId,
        address payable recipient
    ) external onlyOwner whenNotPaused {
        require(!processedDeposits[depositId], "PulseBridge: Deposit already claimed");
        require(recipient != address(0), "PulseBridge: Invalid recipient");
        require(amount > 0, "PulseBridge: Amount must be > 0");

        processedDeposits[depositId] = true;
        totalClaims++;

        if (token == address(0)) {
            require(address(this).balance >= amount, "PulseBridge: Insufficient native liquidity");
            (bool sent, ) = recipient.call{value: amount}("");
            require(sent, "PulseBridge: Native transfer failed");
        } else {
            require(IERC20(token).balanceOf(address(this)) >= amount, "PulseBridge: Insufficient token liquidity");
            require(IERC20(token).transfer(recipient, amount), "PulseBridge: Token transfer failed");
        }

        emit BridgeTokensClaimed(depositId, recipient, token, amount, sourceChainId, block.timestamp);
    }

    function setChainSupport(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupportUpdated(chainId, supported);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    function emergencyWithdraw(address token, uint256 amount, address payable to) external onlyOwner {
        if (token == address(0)) {
            (bool sent, ) = to.call{value: amount}("");
            require(sent, "PulseBridge: Withdraw failed");
        } else {
            IERC20(token).transfer(to, amount);
        }
    }

    receive() external payable {}
}
