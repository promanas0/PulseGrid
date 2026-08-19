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
    string public constant symbol = "ARC-FLIP-V2";

    address public owner;
    
    // Official Arc Testnet USDC (6 decimals)
    address public constant USDC_ADDRESS = 0x3600000000000000000000000000000000000000;

    // Minimum & Maximum Bet Limits (in USDC 6 decimals & Native Wei)
    uint256 public minBetUSDC = 100_000;          // 0.10 USDC
    uint256 public maxBetUSDC = 100_000_000;      // 100.00 USDC
    uint256 public minBetNative = 0.001 ether;
    uint256 public maxBetNative = 10 ether;

    // Multiplier: 2.00x payout (200 / 100)
    // House fee: 0 bps = pure 2.00x payout
    uint256 public houseFeeBps = 0;

    // Global Statistics
    uint256 public totalFlips;
    uint256 public totalUSDCWagered;
    uint256 public totalUSDCPaidOut;
    uint256 public totalNativeWagered;
    uint256 public totalNativePaidOut;

    // Nonce for randomness entropy
    uint256 private nonce;
    bool private _locked;

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

    modifier nonReentrant() {
        require(!_locked, "ArcPulseCoinFlip: Reentrancy guard");
        _locked = true;
        _;
        _locked = false;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        emit HouseBankrollDeposited(msg.sender, 0, msg.value);
    }

    fallback() external payable {
        emit HouseBankrollDeposited(msg.sender, 0, msg.value);
    }

    /**
     * @notice Execute an on-chain Coin Flip using ERC-20 USDC
     * @param choice 0 for Heads, 1 for Tails
     * @param betAmount Amount of USDC to bet (6 decimals, e.g. 100_000 = 0.1 USDC)
     * @param clientSeed Optional entropy string provided by player for provable fairness
     */
    function flipUSDC(uint8 choice, uint256 betAmount, string calldata clientSeed) external nonReentrant returns (bool won, uint8 outcome, uint256 payout) {
        require(choice == 0 || choice == 1, "ArcPulseCoinFlip: Choice must be 0 (Heads) or 1 (Tails)");
        require(betAmount >= minBetUSDC, "ArcPulseCoinFlip: Bet amount below minimum");
        require(betAmount <= maxBetUSDC, "ArcPulseCoinFlip: Bet amount exceeds maximum");

        uint256 potentialPayout = (betAmount * 2) - ((betAmount * 2 * houseFeeBps) / 10000);
        require(IERC20(USDC_ADDRESS).balanceOf(address(this)) >= potentialPayout, "ArcPulseCoinFlip: House reserve insufficient for payout");

        // Transfer bet from player to contract
        bool success = IERC20(USDC_ADDRESS).transferFrom(msg.sender, address(this), betAmount);
        require(success, "ArcPulseCoinFlip: USDC transferFrom failed");

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
            totalUSDCPaidOut += payout;
            
            playerStats[msg.sender].winsCount++;
            playerStats[msg.sender].totalWonUSDC += payout;

            bool paySuccess = IERC20(USDC_ADDRESS).transfer(msg.sender, payout);
            require(paySuccess, "ArcPulseCoinFlip: Payout transfer failed");
        } else {
            playerStats[msg.sender].lossesCount++;
        }

        playerStats[msg.sender].flipsCount++;
        playerStats[msg.sender].totalWageredUSDC += betAmount;

        // Record flip history (max 30 in memory array)
        if (recentFlips.length < 30) {
            recentFlips.push(FlipRecord({
                player: msg.sender,
                choice: choice,
                outcome: outcome,
                won: won,
                betAmount: betAmount,
                payoutAmount: payout,
                isNative: false,
                timestamp: block.timestamp,
                seedHash: seedHash
            }));
        } else {
            recentFlips[totalFlips % 30] = FlipRecord({
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
        }

        emit CoinFlipped(msg.sender, choice, outcome, won, betAmount, payout, false, block.timestamp, seedHash);
        return (won, outcome, payout);
    }

    /**
     * @notice Execute an on-chain Coin Flip using Native USDC (msg.value)
     * @param choice 0 for Heads, 1 for Tails
     * @param clientSeed Optional entropy string provided by player
     */
    function flipNative(uint8 choice, string calldata clientSeed) external payable nonReentrant returns (bool won, uint8 outcome, uint256 payout) {
        require(choice == 0 || choice == 1, "ArcPulseCoinFlip: Choice must be 0 (Heads) or 1 (Tails)");
        require(msg.value >= minBetNative, "ArcPulseCoinFlip: Bet amount below minimum");
        require(msg.value <= maxBetNative, "ArcPulseCoinFlip: Bet amount exceeds maximum");

        uint256 betAmount = msg.value;
        uint256 potentialPayout = (betAmount * 2) - ((betAmount * 2 * houseFeeBps) / 10000);
        require(address(this).balance >= potentialPayout, "ArcPulseCoinFlip: House reserve insufficient for payout");

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
            totalNativePaidOut += payout;

            playerStats[msg.sender].winsCount++;

            (bool sent, ) = payable(msg.sender).call{value: payout}("");
            require(sent, "ArcPulseCoinFlip: Native payout transfer failed");
        } else {
            playerStats[msg.sender].lossesCount++;
        }

        playerStats[msg.sender].flipsCount++;

        if (recentFlips.length < 30) {
            recentFlips.push(FlipRecord({
                player: msg.sender,
                choice: choice,
                outcome: outcome,
                won: won,
                betAmount: betAmount,
                payoutAmount: payout,
                isNative: true,
                timestamp: block.timestamp,
                seedHash: seedHash
            }));
        } else {
            recentFlips[totalFlips % 30] = FlipRecord({
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
        }

        emit CoinFlipped(msg.sender, choice, outcome, won, betAmount, payout, true, block.timestamp, seedHash);
        return (won, outcome, payout);
    }

    /**
     * @notice Deposit ERC-20 USDC into the House Bankroll
     * @param amount Amount of USDC (6 decimals)
     */
    function depositHouseUSDC(uint256 amount) external {
        require(amount > 0, "ArcPulseCoinFlip: Amount must be > 0");
        bool success = IERC20(USDC_ADDRESS).transferFrom(msg.sender, address(this), amount);
        require(success, "ArcPulseCoinFlip: USDC transfer failed");
        emit HouseBankrollDeposited(msg.sender, amount, 0);
    }

    /**
     * @notice Deposit Native USDC into the House Bankroll
     */
    function depositHouseNative() external payable {
        require(msg.value > 0, "ArcPulseCoinFlip: Amount must be > 0");
        emit HouseBankrollDeposited(msg.sender, 0, msg.value);
    }

    /**
     * @notice Withdraw House Bankroll (Owner only)
     * @param usdcAmount Amount of ERC-20 USDC to withdraw
     * @param nativeAmount Amount of Native USDC to withdraw
     */
    function withdrawHouseBankroll(uint256 usdcAmount, uint256 nativeAmount) external onlyOwner nonReentrant {
        if (usdcAmount > 0) {
            require(IERC20(USDC_ADDRESS).balanceOf(address(this)) >= usdcAmount, "ArcPulseCoinFlip: Insufficient USDC");
            bool success = IERC20(USDC_ADDRESS).transfer(owner, usdcAmount);
            require(success, "ArcPulseCoinFlip: USDC withdraw failed");
        }
        if (nativeAmount > 0) {
            require(address(this).balance >= nativeAmount, "ArcPulseCoinFlip: Insufficient Native");
            (bool sent, ) = payable(owner).call{value: nativeAmount}("");
            require(sent, "ArcPulseCoinFlip: Native withdraw failed");
        }
        emit HouseBankrollWithdrawn(owner, usdcAmount, nativeAmount);
    }

    /**
     * @notice Get Live House Bankroll and Global Statistics
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
     * @notice Get Recent Flips array
     */
    function getRecentFlips() external view returns (FlipRecord[] memory) {
        return recentFlips;
    }

    /**
     * @notice Update Bet Limits (Owner only)
     */
    function setBetLimits(uint256 _minUSDC, uint256 _maxUSDC, uint256 _minNative, uint256 _maxNative) external onlyOwner {
        require(_minUSDC < _maxUSDC, "ArcPulseCoinFlip: Min must be < Max");
        minBetUSDC = _minUSDC;
        maxBetUSDC = _maxUSDC;
        minBetNative = _minNative;
        maxBetNative = _maxNative;
        emit LimitsUpdated(_minUSDC, _maxUSDC, _minNative, _maxNative);
    }

    /**
     * @notice Transfer contract ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ArcPulseCoinFlip: Invalid address");
        owner = newOwner;
    }
}
