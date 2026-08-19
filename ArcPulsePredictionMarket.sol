// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcPulsePredictionMarket
 * @dev High-Performance Binary Prediction Market (Polymarket / Parimutuel Pool) on Circle Arc L1 Testnet (Chain ID 5042002).
 * Operates natively with Official Arc Testnet ERC-20 USDC (6 Decimals: 0x3600000000000000000000000000000000000000).
 * PulseGrid & ArchPulse Web3 Ecosystem.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract ArcPulsePredictionMarket {
    string public constant name = "ArcPulse Prediction Markets";
    string public constant symbol = "ARC-PREDICT";

    address public owner;
    address public constant USDC_ADDRESS = 0x3600000000000000000000000000000000000000;

    // Market Resolution Outcomes
    enum Outcome { UNRESOLVED, YES, NO, CANCELLED }

    struct Market {
        uint256 id;
        string title;
        string category;
        string iconUri;
        uint256 endTime;
        uint256 totalYesAmount; // In USDC units (6 decimals)
        uint256 totalNoAmount;  // In USDC units (6 decimals)
        Outcome outcome;
        bool resolved;
        bool exists;
    }

    struct Position {
        uint256 yesAmount;      // In USDC units (6 decimals)
        uint256 noAmount;       // In USDC units (6 decimals)
        bool claimed;
    }

    // State Variables
    uint256 public marketCount;
    uint256 public totalVolumeUSDC;
    uint256 public totalPayoutsClaimedUSDC;
    uint256 public totalBetsCount;

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public userPositions;
    mapping(address => uint256[]) private _userParticipatedMarketIds;
    mapping(address => mapping(uint256 => bool)) private _hasParticipated;

    // Minimum & Maximum bet limits (USDC 6 decimals)
    uint256 public minBetUSDC = 100_000;      // 0.10 USDC
    uint256 public maxBetUSDC = 50_000_000_000; // 50,000 USDC

    // Protocol Fee (in basis points, 0 bps by default for testnet)
    uint256 public protocolFeeBps = 0; 
    address public feeRecipient;

    // Reentrancy lock
    bool private _locked;

    // Events
    event MarketCreated(uint256 indexed marketId, string title, string category, uint256 endTime);
    event SharesPurchased(uint256 indexed marketId, address indexed user, bool isYes, uint256 usdcAmount, uint256 totalYesAmount, uint256 totalNoAmount);
    event MarketResolved(uint256 indexed marketId, Outcome outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 payoutAmount);
    event ProtocolFeeUpdated(uint256 newFeeBps, address newRecipient);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    constructor() {
        owner = msg.sender;
        feeRecipient = msg.sender;
    }

    /**
     * @notice Seed default Flagship Markets in batch
     */
    function seedDefaultMarkets() external onlyOwner {
        require(marketCount == 0, "Markets already seeded");
        _createMarketInternal("Will Bitcoin surpass $100,000 before December 31, 2026?", "Macro Milestone", "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", 1798761599, 6800_000_000, 3200_000_000);
        _createMarketInternal("Will Circle Arc L1 process >10,000 TPS on Testnet Stress Phase?", "Arc Ecosystem", "logo.png", 1794700799, 8400_000_000, 1600_000_000);
        _createMarketInternal("Will US SEC approve Staking for Ethereum Spot ETFs in 2026?", "Regulation & ETFs", "https://assets.coingecko.com/coins/images/279/small/ethereum.png", 1793404799, 5400_000_000, 4600_000_000);
        _createMarketInternal("Will Solana 30-day DEX Volume surpass Ethereum L1 DEX Volume?", "DeFi & Volume", "https://assets.coingecko.com/coins/images/4128/small/solana.png", 1796083199, 6200_000_000, 3800_000_000);
        _createMarketInternal("Will the US Federal Reserve cut interest rates by 50bps or more?", "Macro Economics", "https://assets.coingecko.com/coins/images/325/small/Tether.png", 1789775999, 7400_000_000, 2600_000_000);
        _createMarketInternal("Will Arc L1 micro gas fee stay strictly below 0.002 USDC during peak congestion?", "Arc Ecosystem", "logo.png", 1792108799, 9400_000_000, 600_000_000);
    }

    function _createMarketInternal(
        string memory title,
        string memory category,
        string memory iconUri,
        uint256 endTime,
        uint256 initialYesWeight,
        uint256 initialNoWeight
    ) internal returns (uint256) {
        uint256 id = marketCount;
        markets[id] = Market({
            id: id,
            title: title,
            category: category,
            iconUri: iconUri,
            endTime: endTime,
            totalYesAmount: initialYesWeight,
            totalNoAmount: initialNoWeight,
            outcome: Outcome.UNRESOLVED,
            resolved: false,
            exists: true
        });
        emit MarketCreated(id, title, category, endTime);
        marketCount++;
        return id;
    }

    /**
     * @notice Create a new binary prediction market
     */
    function createMarket(
        string memory title,
        string memory category,
        string memory iconUri,
        uint256 endTime,
        uint256 initialYesWeight,
        uint256 initialNoWeight
    ) external onlyOwner returns (uint256) {
        require(endTime > block.timestamp, "End time must be in future");
        require(initialYesWeight > 0 && initialNoWeight > 0, "Initial weights must be positive");
        return _createMarketInternal(title, category, iconUri, endTime, initialYesWeight, initialNoWeight);
    }

    /**
     * @notice Place an on-chain bet / stake USDC on YES or NO for a market
     * @param marketId The target market ID
     * @param isYes True for YES outcome, False for NO outcome
     * @param usdcAmount Amount in USDC units (6 decimals, e.g. 10_000_000 = 10 USDC)
     */
    function buyShares(uint256 marketId, bool isYes, uint256 usdcAmount) external nonReentrant {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(!m.resolved, "Market already resolved");
        require(block.timestamp < m.endTime, "Market trading has ended");
        require(usdcAmount >= minBetUSDC, "Bet below minimum limit");
        require(usdcAmount <= maxBetUSDC, "Bet exceeds maximum limit");

        // Transfer USDC from user to this contract
        IERC20 usdc = IERC20(USDC_ADDRESS);
        require(usdc.balanceOf(msg.sender) >= usdcAmount, "Insufficient USDC balance");
        require(usdc.allowance(msg.sender, address(this)) >= usdcAmount, "Insufficient USDC allowance");
        
        bool success = usdc.transferFrom(msg.sender, address(this), usdcAmount);
        require(success, "USDC transfer failed");

        // Update market and user position
        if (isYes) {
            m.totalYesAmount += usdcAmount;
            userPositions[marketId][msg.sender].yesAmount += usdcAmount;
        } else {
            m.totalNoAmount += usdcAmount;
            userPositions[marketId][msg.sender].noAmount += usdcAmount;
        }

        if (!_hasParticipated[msg.sender][marketId]) {
            _hasParticipated[msg.sender][marketId] = true;
            _userParticipatedMarketIds[msg.sender].push(marketId);
        }

        totalVolumeUSDC += usdcAmount;
        totalBetsCount++;

        emit SharesPurchased(marketId, msg.sender, isYes, usdcAmount, m.totalYesAmount, m.totalNoAmount);
    }

    /**
     * @notice Settle and resolve the winning outcome for a market (Oracle / Admin)
     */
    function resolveMarket(uint256 marketId, Outcome outcome) external onlyOwner {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(!m.resolved, "Market already resolved");
        require(outcome == Outcome.YES || outcome == Outcome.NO || outcome == Outcome.CANCELLED, "Invalid outcome");

        m.outcome = outcome;
        m.resolved = true;

        emit MarketResolved(marketId, outcome);
    }

    /**
     * @notice Calculate claimable payout for a user on a resolved market
     */
    function getClaimablePayout(uint256 marketId, address user) public view returns (uint256) {
        Market memory m = markets[marketId];
        if (!m.resolved) return 0;
        
        Position memory pos = userPositions[marketId][user];
        if (pos.claimed) return 0;

        uint256 totalPool = m.totalYesAmount + m.totalNoAmount;

        if (m.outcome == Outcome.YES) {
            if (pos.yesAmount == 0 || m.totalYesAmount == 0) return 0;
            return (pos.yesAmount * totalPool) / m.totalYesAmount;
        } else if (m.outcome == Outcome.NO) {
            if (pos.noAmount == 0 || m.totalNoAmount == 0) return 0;
            return (pos.noAmount * totalPool) / m.totalNoAmount;
        } else if (m.outcome == Outcome.CANCELLED) {
            return pos.yesAmount + pos.noAmount;
        }

        return 0;
    }

    /**
     * @notice Claim on-chain USDC winnings or refund from a resolved market
     */
    function claimWinnings(uint256 marketId) external nonReentrant returns (uint256 payout) {
        Market memory m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(m.resolved, "Market not yet resolved");

        Position storage pos = userPositions[marketId][msg.sender];
        require(!pos.claimed, "Winnings already claimed");

        payout = getClaimablePayout(marketId, msg.sender);
        require(payout > 0, "No claimable payout available");

        pos.claimed = true;
        totalPayoutsClaimedUSDC += payout;

        IERC20 usdc = IERC20(USDC_ADDRESS);
        require(usdc.balanceOf(address(this)) >= payout, "Contract USDC reserve low");

        bool success = usdc.transfer(msg.sender, payout);
        require(success, "Payout transfer failed");

        emit WinningsClaimed(marketId, msg.sender, payout);
    }

    /**
     * @notice Get dynamic probabilities and pricing for a market (in percentage 0-100 & USDC price)
     */
    function getMarketProbabilities(uint256 marketId) external view returns (
        uint256 yesPct,
        uint256 noPct,
        uint256 yesPriceUsdcBps, // e.g. 6800 = $0.68
        uint256 noPriceUsdcBps   // e.g. 3200 = $0.32
    ) {
        Market memory m = markets[marketId];
        require(m.exists, "Market does not exist");
        uint256 total = m.totalYesAmount + m.totalNoAmount;
        if (total == 0) return (50, 50, 5000, 5000);

        yesPct = (m.totalYesAmount * 100) / total;
        noPct = 100 - yesPct;
        yesPriceUsdcBps = (m.totalYesAmount * 10000) / total;
        noPriceUsdcBps = 10000 - yesPriceUsdcBps;
    }

    /**
     * @notice View user's positions across all participated markets
     */
    function getUserParticipatedMarkets(address user) external view returns (uint256[] memory) {
        return _userParticipatedMarketIds[user];
    }

    /**
     * @notice Get all markets details in batch
     */
    function getAllMarkets() external view returns (Market[] memory) {
        Market[] memory all = new Market[](marketCount);
        for (uint256 i = 0; i < marketCount; i++) {
            all[i] = markets[i];
        }
        return all;
    }

    function setLimits(uint256 _minBetUSDC, uint256 _maxBetUSDC) external onlyOwner {
        minBetUSDC = _minBetUSDC;
        maxBetUSDC = _maxBetUSDC;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    function emergencyWithdrawUSDC(uint256 amount) external onlyOwner {
        IERC20(USDC_ADDRESS).transfer(owner, amount);
    }
}
