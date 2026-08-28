// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PulseSwapRouter
 * @dev Multi-Token Constant-Product AMM Liquidity Router for Arc L1 Testnet (Chain ID 5042002).
 * Enables 1-click liquidity pool creation and atomic trading for any Arc custom ERC-20 token against native USDC.
 * Built for PulseGrid Web3 Ecosystem.
 */

interface IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract PulseSwapRouter {
    string public constant name = "PulseSwap AMM Router";
    string public constant version = "1.0.0";
    
    // Fee: 0.3% (30 bps out of 10,000)
    uint256 public constant FEE_BPS = 30;
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct Pool {
        uint256 usdcReserve;    // Native USDC reserve in wei
        uint256 tokenReserve;   // Custom ERC-20 token reserve in token units
        uint256 totalLpShares;  // Total LP shares issued
        uint256 createdAt;      // Timestamp
        uint256 totalSwaps;     // Total trade counter
        bool exists;            // Whether pool has been seeded
    }

    // Mapping from token address => Pool data
    mapping(address => Pool) public pools;
    
    // Mapping from token address => LP user address => shares
    mapping(address => mapping(address => uint256)) public lpBalances;

    // Array of all token addresses with initialized pools
    address[] public allPoolTokens;

    // Reentrancy Guard
    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "Reentrant call");
        _locked = 2;
        _;
        _locked = 1;
    }

    // Events
    event PoolCreated(
        address indexed token,
        address indexed creator,
        uint256 usdcAmount,
        uint256 tokenAmount,
        uint256 lpShares,
        uint256 timestamp
    );

    event LiquidityAdded(
        address indexed token,
        address indexed provider,
        uint256 usdcAmount,
        uint256 tokenAmount,
        uint256 lpShares
    );

    event LiquidityRemoved(
        address indexed token,
        address indexed provider,
        uint256 usdcAmount,
        uint256 tokenAmount,
        uint256 lpShares
    );

    event TokenSwap(
        address indexed token,
        address indexed trader,
        bool isBuy,
        uint256 usdcAmount,
        uint256 tokenAmount,
        uint256 timestamp
    );

    receive() external payable {}
    fallback() external payable {}

    /**
     * @notice Create a new AMM Liquidity Pool for any Arc custom token
     * @param token Address of the custom ERC-20 token
     * @param tokenAmount Number of tokens to seed into the pool
     */
    function createPool(address token, uint256 tokenAmount) external payable nonReentrant returns (uint256 lpShares) {
        require(token != address(0), "Invalid token");
        require(msg.value > 0, "Must seed USDC liquidity");
        require(tokenAmount > 0, "Must seed token amount");
        require(!pools[token].exists, "Pool already exists");

        // Pull tokens from creator (requires approval beforehand)
        bool pulled = IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);
        require(pulled, "Token transferFrom failed");

        // Initial LP shares = sqrt(usdcAmount * tokenAmount)
        lpShares = sqrt(msg.value * tokenAmount);
        require(lpShares > 0, "Zero LP shares minted");

        pools[token] = Pool({
            usdcReserve: msg.value,
            tokenReserve: tokenAmount,
            totalLpShares: lpShares,
            createdAt: block.timestamp,
            totalSwaps: 0,
            exists: true
        });

        lpBalances[token][msg.sender] = lpShares;
        allPoolTokens.push(token);

        emit PoolCreated(token, msg.sender, msg.value, tokenAmount, lpShares, block.timestamp);
        return lpShares;
    }

    /**
     * @notice Add liquidity to an existing pool
     */
    function addLiquidity(address token, uint256 tokenAmount) external payable nonReentrant returns (uint256 lpShares) {
        Pool storage pool = pools[token];
        require(pool.exists, "Pool does not exist");
        require(msg.value > 0 && tokenAmount > 0, "Zero amounts");

        // Calculate proportional LP shares based on USDC deposited
        uint256 sharesFromUsdc = (msg.value * pool.totalLpShares) / pool.usdcReserve;
        uint256 sharesFromToken = (tokenAmount * pool.totalLpShares) / pool.tokenReserve;
        lpShares = sharesFromUsdc < sharesFromToken ? sharesFromUsdc : sharesFromToken;
        require(lpShares > 0, "Zero LP shares");

        bool pulled = IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);
        require(pulled, "Token transfer failed");

        pool.usdcReserve += msg.value;
        pool.tokenReserve += tokenAmount;
        pool.totalLpShares += lpShares;
        lpBalances[token][msg.sender] += lpShares;

        emit LiquidityAdded(token, msg.sender, msg.value, tokenAmount, lpShares);
        return lpShares;
    }

    /**
     * @notice Remove liquidity and burn LP shares
     */
    function removeLiquidity(address token, uint256 lpShares) external nonReentrant returns (uint256 usdcOut, uint256 tokenOut) {
        Pool storage pool = pools[token];
        require(pool.exists, "Pool does not exist");
        require(lpShares > 0, "Zero shares");
        require(lpBalances[token][msg.sender] >= lpShares, "Insufficient LP balance");

        usdcOut = (lpShares * pool.usdcReserve) / pool.totalLpShares;
        tokenOut = (lpShares * pool.tokenReserve) / pool.totalLpShares;
        require(usdcOut > 0 && tokenOut > 0, "Zero refund");

        lpBalances[token][msg.sender] -= lpShares;
        pool.totalLpShares -= lpShares;
        pool.usdcReserve -= usdcOut;
        pool.tokenReserve -= tokenOut;

        // Transfer token and USDC back to provider
        bool sentToken = IERC20(token).transfer(msg.sender, tokenOut);
        require(sentToken, "Token refund failed");

        (bool sentUsdc, ) = payable(msg.sender).call{value: usdcOut}("");
        require(sentUsdc, "USDC refund failed");

        emit LiquidityRemoved(token, msg.sender, usdcOut, tokenOut, lpShares);
        return (usdcOut, tokenOut);
    }

    /**
     * @notice Buy tokens using Native USDC (x * y = k Constant Product AMM)
     */
    function swapUSDCForTokens(address token, uint256 minTokensOut) external payable nonReentrant returns (uint256 tokensOut) {
        Pool storage pool = pools[token];
        require(pool.exists, "Pool does not exist");
        require(msg.value > 0, "Must send USDC");

        uint256 amountInWithFee = msg.value * (BPS_DENOMINATOR - FEE_BPS);
        uint256 numerator = amountInWithFee * pool.tokenReserve;
        uint256 denominator = (pool.usdcReserve * BPS_DENOMINATOR) + amountInWithFee;
        tokensOut = numerator / denominator;

        require(tokensOut >= minTokensOut, "Slippage: received less than minimum");
        require(tokensOut < pool.tokenReserve, "Insufficient pool reserve");

        pool.usdcReserve += msg.value;
        pool.tokenReserve -= tokensOut;
        pool.totalSwaps += 1;

        bool sent = IERC20(token).transfer(msg.sender, tokensOut);
        require(sent, "Token transfer failed");

        emit TokenSwap(token, msg.sender, true, msg.value, tokensOut, block.timestamp);
        return tokensOut;
    }

    /**
     * @notice Sell tokens for Native USDC (x * y = k Constant Product AMM)
     */
    function swapTokensForUSDC(address token, uint256 tokenAmount, uint256 minUsdcOut) external nonReentrant returns (uint256 usdcOut) {
        Pool storage pool = pools[token];
        require(pool.exists, "Pool does not exist");
        require(tokenAmount > 0, "Must specify token amount");

        // Pull tokens from trader
        bool pulled = IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);
        require(pulled, "Token transferFrom failed. Approve router first.");

        uint256 amountInWithFee = tokenAmount * (BPS_DENOMINATOR - FEE_BPS);
        uint256 numerator = amountInWithFee * pool.usdcReserve;
        uint256 denominator = (pool.tokenReserve * BPS_DENOMINATOR) + amountInWithFee;
        usdcOut = numerator / denominator;

        require(usdcOut >= minUsdcOut, "Slippage: received less than minimum");
        require(usdcOut < pool.usdcReserve, "Insufficient pool USDC reserve");

        pool.tokenReserve += tokenAmount;
        pool.usdcReserve -= usdcOut;
        pool.totalSwaps += 1;

        (bool sent, ) = payable(msg.sender).call{value: usdcOut}("");
        require(sent, "USDC transfer failed");

        emit TokenSwap(token, msg.sender, false, usdcOut, tokenAmount, block.timestamp);
        return usdcOut;
    }

    // --- VIEW HELPERS ---

    /**
     * @notice Calculate expected output for a swap
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256 amountOut) {
        require(amountIn > 0, "Zero amount in");
        require(reserveIn > 0 && reserveOut > 0, "Zero reserves");
        uint256 amountInWithFee = amountIn * (BPS_DENOMINATOR - FEE_BPS);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * BPS_DENOMINATOR) + amountInWithFee;
        return numerator / denominator;
    }

    /**
     * @notice Get pool summary for a given token
     */
    function getPool(address token) external view returns (
        uint256 usdcReserve,
        uint256 tokenReserve,
        uint256 totalLpShares,
        uint256 createdAt,
        uint256 totalSwaps,
        bool exists
    ) {
        Pool memory p = pools[token];
        return (p.usdcReserve, p.tokenReserve, p.totalLpShares, p.createdAt, p.totalSwaps, p.exists);
    }

    /**
     * @notice Returns total number of active pools
     */
    function totalPools() external view returns (uint256) {
        return allPoolTokens.length;
    }

    /**
     * @notice Returns list of all tokens with pools
     */
    function getAllPoolTokens() external view returns (address[] memory) {
        return allPoolTokens;
    }

    /**
     * @notice Returns user LP balance for a pool
     */
    function getUserLpBalance(address token, address user) external view returns (uint256) {
        return lpBalances[token][user];
    }

    /**
     * @dev Simple square root calculation for geometric mean
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
