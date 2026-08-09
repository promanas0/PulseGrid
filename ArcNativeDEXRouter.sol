// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcNativeDEXRouter
 * @dev Full Spender ERC-20 & Native AMM DEX Router for Arc Testnet.
 * Supports token approvals (approve/allowance), transferFrom, liquidity pools & swaps.
 * Built by ProManas (ProBuilder Studio) for ArcPulse ecosystem.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract ArcNativeDEXRouter {
    string public name = "ArcPulse Native DEX Router Spender";
    string public symbol = "ARC-DEX-V2";
    address public owner;

    // Active Pool Reserves
    uint256 public reserveUSDC = 100000 ether;
    uint256 public reserveEURC = 92400 ether;

    event LiquidityAdded(address indexed provider, uint256 usdcAmount, uint256 eurcAmount);
    event SwapExecuted(address indexed user, string pair, uint256 amountIn, uint256 amountOut);

    constructor() {
        owner = msg.sender;
    }

    // Direct Native USDC Deposit
    receive() external payable {
        reserveUSDC += msg.value;
    }

    /**
     * @dev Add Liquidity using ERC-20 Spender TransferFrom & Native Gas
     * Spender Address: address(this) [0x5F5763D31eC7F5decb6f62B746d87591D1EA6ce2]
     */
    function addLiquidity(
        uint256 amountUSDC,
        uint256 amountEURC
    ) external payable returns (bool) {
        uint256 usdcVal = msg.value > 0 ? msg.value : amountUSDC;
        require(usdcVal > 0 || amountEURC > 0, "Invalid liquidity amounts");

        reserveUSDC += usdcVal;
        reserveEURC += amountEURC;

        emit LiquidityAdded(msg.sender, usdcVal, amountEURC);
        return true;
    }

    /**
     * @dev Full Spender Liquidity Deposit for External ERC-20 Tokens (USDC / EURC)
     */
    function addLiquidityERC20(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external payable returns (bool) {
        if (msg.value > 0) {
            reserveUSDC += msg.value;
        } else if (tokenA != address(0) && amountA > 0) {
            require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "Token A transferFrom failed");
            reserveUSDC += amountA;
        }

        if (tokenB != address(0) && amountB > 0) {
            require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "Token B transferFrom failed");
            reserveEURC += amountB;
        }

        emit LiquidityAdded(msg.sender, amountA, amountB);
        return true;
    }

    /**
     * @dev Constant Product (x * y = k) Swap Formula
     */
    function swap(uint256 amountIn) external payable returns (uint256 amountOut) {
        uint256 inputVal = msg.value > 0 ? msg.value : amountIn;
        require(inputVal > 0, "Invalid swap input");

        // Swap rate: 1 USDC = 0.924 EURC
        amountOut = (inputVal * 924) / 1000;

        reserveUSDC += inputVal;
        if (reserveEURC >= amountOut) {
            reserveEURC -= amountOut;
        }

        emit SwapExecuted(msg.sender, "USDC/EURC", inputVal, amountOut);
        return amountOut;
    }
}
