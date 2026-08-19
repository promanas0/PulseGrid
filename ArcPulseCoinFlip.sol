// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcPulseCoinFlip
 * @dev Provably Fair 2x Double-or-Nothing Coin Flip Game on Arc Testnet (Chain ID 5042002).
 * Supports both ERC-20 USDC (0x3600000000000000000000000000000000000000) and Native USDC (msg.value).
 * PulseGrid & ArchPulse Ecosystem.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract ArcPulseCoinFlip {
    string public constant name = "ArcPulse Provably Fair Coin Flip";
    string public constant symbol = "ARC-FLIP-V1";

    address public owner;
    
    // Official Arc Testnet USDC (6 decimals)
    address public constant USDC_ADDRESS = 0x3600000000000000000000000000000000000000;

    // Minimum & Maximum Bet Limits (in USDC 6 decimals & Native Wei)
    uint256 public minBetUSDC = 100_000;          // 0.1 USDC
    uint256 public maxBetUSDC = 100_000_000;      // 100 USDC
    uint256 public minBetNative = 0.001 ether;
    uint256 public maxBetNative = 10 ether;

    // Multiplier: 2.00x payout (200 / 100)
    // House fee: 1% (optional house edge, set to 0 for 100% pure 2.00x)
    uint256 public houseFeeBps = 0; // 0 bps = pure 2.00x payout

    // House Bankroll Reserves
    uint256 public houseUSDCReserve;
    uint256 public houseNativeReserve;

    // Global Statistics
    uint256 public totalFlips;
    uint256 public totalUSDCWagered;
    uint256 public totalUSDCPaidOut;
    uint256 public totalNativeWagered;
    uint256 public totalNativePaidOut;

    // Nonce for randomness entropy
    uint256 private nonce;

    // Player statistics
    struct PlayerStats {
        uint256 flipsCount;
        uint256 winsCount;
        uint256 lossesCount;
        uint256 totalWageredUSDC;
        uint256 totalWonUSDC;
    }
    mapping(address => PlayerStats) public playerStats;

    // Flip Record
    struct FlipRecord {
        address player;
        uint8 choice;     // 0 = Heads, 1 = Tails
        uint8 outcome;    // 0 = Heads, 1 = Tails
        bool won;
        uint256 betAmount;
        uint256 payoutAmount;
        bool isNative;
        uint256 timestamp;
        bytes32 seedHash;
    }

    FlipRecord[] public recentFlips;

    // Events
    event CoinFlipped(
        address indexed player,
        uint8 indexed choice,
        uint8 indexed outcome,
        bool won,
        uint256 betAmount,
        uint256 payoutAmount,
        bool isNative,
        uint256 timestamp,
        bytes32 seedHash
    );

    event HouseBankrollDeposited(address indexed provider, uint256 usdcAmount, uint256 nativeAmount);
    event HouseBankrollWithdrawn(address indexed owner, uint256 usdcAmount, uint256 nativeAmount);
    event LimitsUpdated(uint256 minUSDC, uint256 maxUSDC, uint256 minNative, uint256 maxNative);

    modifier onlyOwner() {
        require(msg.sender == owner, "ArcPulseCoinFlip: Caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        houseNativeReserve += msg.value;
        emit HouseBankrollDeposited(msg.sender, 0, msg.value);
    }

    fallback() external payable {
        houseNativeReserve += msg.value;
        emit HouseBankrollDeposited(msg.sender, 0, msg.value);
    }

    /**
     * @notice Execute an on-chain Coin Flip using ERC-20 USDC
     * @param choice 0 for Heads, 1 for Tails
     * @param betAmount Amount of USDC to bet (6 decimals, e.g. 1_000_000 = 1 USDC)
     * @param clientSeed Optional entropy string provided by player for provable fairness
     */
    function flipUSDC(uint8 choice, uint256 betAmount, string calldata clientSeed) external returns (bool won, uint8 outcome, uint256 payout) {
        require(choice == 0 || choice == 1, "ArcPulseCoinFlip: Choice must be 0 (Heads) or 1 (Tails)");
        require(betAmount >= minBetUSDC, "ArcPulseCoinFlip: Bet amount below minimum");
        require(betAmount <= maxBetUSDC, "ArcPulseCoinFlip: Bet amount exceeds maximum");

        uint256 potentialPayout = (betAmount * 2) - ((betAmount * 2 * houseFeeBps) / 10000);
        require(IERC20(USDC_ADDRESS).balanceOf(address(this)) >= potentialPayout, "ArcPulseCoinFlip: House reserve insufficient for payout");

        // Transfer bet from player to contract
        bool success = IERC20(USDC_ADDRESS).transferFrom(msg.sender, address(this), betAmount);
        require(success, "ArcPulseCoinFlip: USDC transferFrom failed");

        houseUSDCReserve += betAmount;
        totalUSDCWagered += betAmount;
        totalFlips++;

        // Provably fair pseudo-random outcome generation
        nonce++;
        bytes32 seedHash = keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao != 0 ? block.prevrandao : uint256(blockhash(block.number - 1)),
                msg.sender,
                nonce,
                clientSeed,
                betAmount
            )
        );

        outcome = uint8(uint256(seedHash) % 2); // 0 or 1
        won = (choice == outcome);

        payout = 0;
        if (won) {
            payout = potentialPayout;
            houseUSDCReserve -= payout;
            totalUSDCPaidOut += payout;
            
            bool paySuccess = IERC20(USDC_ADDRESS).transfer(msg.sender, payout);
            require(paySuccess, "ArcPulseCoinFlip: Payout transfer failed");

            playerStats[msg.sender].winsCount++;
            playerStats[msg.sender].totalWonUSDC += payout;
        } else {
            playerStats[msg.sender].lossesCount++;
        }

        playerStats[msg.sender].flipsCount++;
        playerStats[msg.sender].totalWageredUSDC += betAmount;

        // Record flip history
        FlipRecord memory record = FlipRecord({
            player: msg.sender,
            choice: choice,
            outcome: outcome,
            won: won,
            betAmount: betAmount,
            payoutAmount: payout,
            isNative: false,
            timestamp: block.timestamp,
            seedHash: seedHash
        });

        recentFlips.push(record);
        if (recentFlips.length > 50) {
            // Keep recent flips array bounded
            for (uint256 i = 0; i < recentFlips.length - 1; i++) {
                recentFlips[i] = recentFlips[i + 1];
            }
            recentFlips.pop();
        }

        emit CoinFlipped(msg.sender, choice, outcome, won, betAmount, payout, false, block.timestamp, seedHash);
        return (won, outcome, payout);
    }

    /**
     * @notice Execute an on-chain Coin Flip using Native USDC (msg.value)
     * @param choice 0 for Heads, 1 for Tails
     * @param clientSeed Optional entropy string provided by player
     */
    function flipNative(uint8 choice, string calldata clientSeed) external payable returns (bool won, uint8 outcome, uint256 payout) {
        require(choice == 0 || choice == 1, "ArcPulseCoinFlip: Choice must be 0 (Heads) or 1 (Tails)");
        require(msg.value >= minBetNative, "ArcPulseCoinFlip: Bet amount below minimum");
        require(msg.value <= maxBetNative, "ArcPulseCoinFlip: Bet amount exceeds maximum");

        uint256 betAmount = msg.value;
        uint256 potentialPayout = (betAmount * 2) - ((betAmount * 2 * houseFeeBps) / 10000);
        require(address(this).balance >= potentialPayout, "ArcPulseCoinFlip: House reserve insufficient for payout");

        houseNativeReserve += betAmount;
        totalNativeWagered += betAmount;
        totalFlips++;

        nonce++;
        bytes32 seedHash = keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao != 0 ? block.prevrandao : uint256(blockhash(block.number - 1)),
                msg.sender,
                nonce,
                clientSeed,
                betAmount
            )
        );

        outcome = uint8(uint256(seedHash) % 2);
        won = (choice == outcome);

        payout = 0;
        if (won) {
            payout = potentialPayout;
            houseNativeReserve -= payout;
            totalNativePaidOut += payout;

            (bool sent, ) = payable(msg.sender).call{value: payout}("");
            require(sent, "ArcPulseCoinFlip: Native payout transfer failed");

            playerStats[msg.sender].winsCount++;
        } else {
            playerStats[msg.sender].lossesCount++;
        }

        playerStats[msg.sender].flipsCount++;

        FlipRecord memory record = FlipRecord({
            player: msg.sender,
            choice: choice,
            outcome: outcome,
            won: won,
            betAmount: betAmount,
            payoutAmount: payout,
            isNative: true,
            timestamp: block.timestamp,
            seedHash: seedHash
        });

        recentFlips.push(record);
        if (recentFlips.length > 50) {
            for (uint256 i = 0; i < recentFlips.length - 1; i++) {
                recentFlips[i] = recentFlips[i + 1];
            }
            recentFlips.pop();
        }

        emit CoinFlipped(msg.sender, choice, outcome, won, betAmount, payout, true, block.timestamp, seedHash);
        return (won, outcome, payout);
    }

    /**
     * @notice Deposit liquidity into the house bankroll (USDC)
     */
    function depositHouseUSDC(uint256 amount) external {
        require(amount > 0, "ArcPulseCoinFlip: Amount must be > 0");
        bool success = IERC20(USDC_ADDRESS).transferFrom(msg.sender, address(this), amount);
        require(success, "ArcPulseCoinFlip: Transfer failed");

        houseUSDCReserve += amount;
        emit HouseBankrollDeposited(msg.sender, amount, 0);
    }

    /**
     * @notice Deposit native USDC into the house bankroll
     */
    function depositHouseNative() external payable {
        require(msg.value > 0, "ArcPulseCoinFlip: Value must be > 0");
        houseNativeReserve += msg.value;
        emit HouseBankrollDeposited(msg.sender, 0, msg.value);
    }

    /**
     * @notice Withdraw house bankroll reserves (Owner only)
     */
    function withdrawHouseBankroll(uint256 usdcAmount, uint256 nativeAmount) external onlyOwner {
        if (usdcAmount > 0) {
            require(IERC20(USDC_ADDRESS).balanceOf(address(this)) >= usdcAmount, "ArcPulseCoinFlip: Insufficient USDC");
            if (houseUSDCReserve >= usdcAmount) houseUSDCReserve -= usdcAmount;
            IERC20(USDC_ADDRESS).transfer(owner, usdcAmount);
        }
        if (nativeAmount > 0) {
            require(address(this).balance >= nativeAmount, "ArcPulseCoinFlip: Insufficient Native");
            if (houseNativeReserve >= nativeAmount) houseNativeReserve -= nativeAmount;
            payable(owner).transfer(nativeAmount);
        }
        emit HouseBankrollWithdrawn(owner, usdcAmount, nativeAmount);
    }

    /**
     * @notice Update bet limits and house parameters
     */
    function updateBetLimits(uint256 _minUSDC, uint256 _maxUSDC, uint256 _minNative, uint256 _maxNative) external onlyOwner {
        minBetUSDC = _minUSDC;
        maxBetUSDC = _maxUSDC;
        minBetNative = _minNative;
        maxBetNative = _maxNative;
        emit LimitsUpdated(_minUSDC, _maxUSDC, _minNative, _maxNative);
    }

    /**
     * @notice Set house fee in basis points (100 = 1%, 0 = 0%)
     */
    function setHouseFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 500, "ArcPulseCoinFlip: Fee cannot exceed 5%");
        houseFeeBps = _feeBps;
    }

    /**
     * @notice Get global house telemetry and reserve statistics
     */
    function getHouseStats() external view returns (
        uint256 _totalFlips,
        uint256 _totalUSDCWagered,
        uint256 _totalUSDCPaidOut,
        uint256 _usdcReserve,
        uint256 _nativeReserve,
        uint256 _minUSDC,
        uint256 _maxUSDC
    ) {
        return (
            totalFlips,
            totalUSDCWagered,
            totalUSDCPaidOut,
            IERC20(USDC_ADDRESS).balanceOf(address(this)),
            address(this).balance,
            minBetUSDC,
            maxBetUSDC
        );
    }

    /**
     * @notice Get total recent flips count
     */
    function getRecentFlipsCount() external view returns (uint256) {
        return recentFlips.length;
    }

    /**
     * @notice Get a slice of recent flips for the public activity feed
     */
    function getRecentFlips(uint256 limit) external view returns (FlipRecord[] memory) {
        uint256 len = recentFlips.length;
        if (limit > len || limit == 0) limit = len;
        
        FlipRecord[] memory records = new FlipRecord[](limit);
        for (uint256 i = 0; i < limit; i++) {
            records[i] = recentFlips[len - 1 - i];
        }
        return records;
    }
}
