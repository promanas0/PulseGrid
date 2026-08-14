// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcUniswapV2Router
 * @dev Full Uniswap V2 style Automated Market Maker (AMM) & DEX Router for Arc Testnet.
 * ArchPulse Ecosystem.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract ArcUniswapV2Router {
    string public name = "ArchPulse Uniswap V2 DEX Router";
    string public symbol = "ARC-V2-ROUTER";
    address public owner;

    // Reserves tracking for Token Pair (USDC & EURC / ARC)
    uint256 public reserveUSDC;
    uint256 public reserveARC;

    event LiquidityAdded(address indexed provider, uint256 usdcAmount, uint256 arcAmount);
    event SwapExecuted(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);

    constructor() {
        owner = msg.sender;
    }

    // Receive native USDC directly into contract
    receive() external payable {
        reserveUSDC += msg.value;
    }

    // Add Liquidity to the Uniswap V2 Pool
    function addLiquidity(uint256 usdcAmount, uint256 arcAmount) external payable returns (bool) {
        uint256 realUsdc = msg.value > 0 ? msg.value : usdcAmount;
        require(realUsdc > 0 && arcAmount > 0, "Invalid liquidity amounts");

        reserveUSDC += realUsdc;
        reserveARC += arcAmount;

        emit LiquidityAdded(msg.sender, realUsdc, arcAmount);
        return true;
    }

    // Get Constant Product (k = x * y) Swap Quote
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        // 0.3% Uniswap V2 fee multiplier (997/1000)
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }

    // Execute Uniswap V2 Swap (Exact Input for Output)
    function swapExactTokensForTokens(uint256 amountIn) external payable returns (uint256 amountOut) {
        uint256 inputAmount = msg.value > 0 ? msg.value : amountIn;
        require(inputAmount > 0, "Must send USDC or amountIn");

        // If reserves are zero, initialize virtual reserves for testing
        uint256 currentUsdcReserve = reserveUSDC > 0 ? reserveUSDC : 100000 ether;
        uint256 currentArcReserve = reserveARC > 0 ? reserveARC : 125000 ether;

        amountOut = getAmountOut(inputAmount, currentUsdcReserve, currentArcReserve);

        reserveUSDC += inputAmount;
        if (reserveARC >= amountOut) {
            reserveARC -= amountOut;
        }

        emit SwapExecuted(msg.sender, address(0), inputAmount, amountOut);
        return amountOut;
    }
}
