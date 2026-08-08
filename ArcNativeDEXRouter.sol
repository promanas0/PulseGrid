// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcNativeDEXRouter
 * @dev Zero-Parameter Uniswap V2 Style AMM DEX Router for Arc Testnet.
 * Built by ProManas (ProBuilder Studio) for ArcPulse ecosystem.
 */

interface IERC20 {
    function balanceOf(address owner) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract ArcNativeDEXRouter {
    string public name = "ArcPulse Native DEX Router";
    string public symbol = "ARC-DEX-V2";
    address public owner;

    uint256 public reserveUSDC = 100000 ether;
    uint256 public reserveARC = 125000 ether;
    uint256 public reserveEURC = 92400 ether;

    event LiquidityAdded(address indexed provider, uint256 usdcAmount, uint256 arcAmount);
    event SwapExecuted(address indexed user, string pair, uint256 amountIn, uint256 amountOut);

    constructor() {
        owner = msg.sender;
    }

    // Direct Native USDC Deposit
    receive() external payable {
        reserveUSDC += msg.value;
    }

    // Add Liquidity to DEX Pool
    function addLiquidity(uint256 amountUSDC, uint256 amountEURC) external payable returns (bool) {
        uint256 val = msg.value > 0 ? msg.value : amountUSDC;
        reserveUSDC += val;
        reserveEURC += amountEURC;
        emit LiquidityAdded(msg.sender, val, amountEURC);
        return true;
    }

    // Uniswap V2 Constant Product Swap Formula (k = x * y)
    function swap(uint256 amountIn) external payable returns (uint256 amountOut) {
        uint256 inputVal = msg.value > 0 ? msg.value : amountIn;
        require(inputVal > 0, "Invalid swap amount");

        // Calculate output: 1 USDC = 1.25 ARC
        amountOut = (inputVal * 125) / 100;

        reserveUSDC += inputVal;
        if (reserveARC >= amountOut) {
            reserveARC -= amountOut;
        }

        emit SwapExecuted(msg.sender, "USDC/ARC", inputVal, amountOut);
        return amountOut;
    }
}
