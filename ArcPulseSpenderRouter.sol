// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcPulseSpenderRouter
 * @dev Official Uniswap V2-style Spender Router Contract for Arc Testnet (Chain ID 5042002).
 * Works alongside ArcPulseFactory to execute atomic swaps and manage liquidity.
 * Built by ProManas (ProBuilder Studio) for ArcPulse Ecosystem.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IArcPulseFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

contract ArcPulseSpenderRouter {
    string public name = "ArcPulse DEX Spender Router";
    string public symbol = "ARC-ROUTER-V2";
    address public owner;
    address public factory;

    // Official Arc Testnet EURC Token Address (ERC-20, 6 decimals)
    address public constant EURC_ADDRESS = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;

    // Rates: 1 USDC = 0.924 EURC | 1 EURC = 1.082 USDC (Scale: 1000)
    uint256 public rateUSDCtoEURC = 924;
    uint256 public rateEURCtoUSDC = 1082;

    event SwapUSDCforEURC(address indexed user, uint256 usdcIn, uint256 eurcOut);
    event SwapEURCforUSDC(address indexed user, uint256 eurcIn, uint256 usdcOut);
    event LiquidityAdded(address indexed provider, uint256 usdcAmount, uint256 eurcAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ArcPulseSpenderRouter: FORBIDDEN");
        _;
    }

    constructor(address _factory) {
        owner = msg.sender;
        factory = _factory;
    }

    receive() external payable {}
    fallback() external payable {}

    /**
     * @notice Check ERC-20 Allowance granted to this Spender Router
     */
    function checkAllowance(address token, address user) external view returns (uint256) {
        return IERC20(token).allowance(user, address(this));
    }

    /**
     * @notice Swap Native USDC (18 decimals in wei) for EURC Tokens (6 decimals)
     * User sends native USDC as msg.value. Spender Router transfers real EURC to user.
     * Function Selector: 0xe89fdb69
     */
    function swapUSDCtoEURC() external payable returns (uint256 eurcOut) {
        uint256 usdcInWei = msg.value;
        require(usdcInWei > 0, "ArcPulseSpenderRouter: Must send native USDC");

        // Convert 18-decimal wei to 6-decimal USDC scale
        uint256 usdc6 = usdcInWei / 10**12;
        if (usdc6 == 0) usdc6 = 1;

        // Calculate 6-decimal EURC output
        eurcOut = (usdc6 * rateUSDCtoEURC) / 1000;

        uint256 dexEURCBal = IERC20(EURC_ADDRESS).balanceOf(address(this));
        if (dexEURCBal > 0) {
            uint256 toSend = eurcOut > dexEURCBal ? dexEURCBal : eurcOut;
            IERC20(EURC_ADDRESS).transfer(msg.sender, toSend);
        }

        emit SwapUSDCforEURC(msg.sender, usdcInWei, eurcOut);
        return eurcOut;
    }

    /**
     * @notice Swap EURC Tokens (6 decimals) for Native USDC (18 decimals in wei)
     * Uses Spender allowance: IERC20(EURC).transferFrom(msg.sender, address(this), amountEURC)
     * Function Selector: 0x0bdd4f29
     */
    function swapEURCtoUSDC(uint256 amountEURC) external returns (uint256 usdcOutWei) {
        require(amountEURC > 0, "ArcPulseSpenderRouter: Must specify EURC amount");

        // Pull EURC from user using Spender approval
        bool pulled = IERC20(EURC_ADDRESS).transferFrom(msg.sender, address(this), amountEURC);
        require(pulled, "ArcPulseSpenderRouter: EURC transferFrom failed. Check Spender approval.");

        // Calculate 18-decimal native USDC wei output (1 EURC = 1.082 USDC)
        usdcOutWei = ((amountEURC * 10**12) * rateEURCtoUSDC) / 1000;

        if (address(this).balance >= usdcOutWei) {
            payable(msg.sender).transfer(usdcOutWei);
        } else if (address(this).balance > 0) {
            payable(msg.sender).transfer(address(this).balance);
        }

        emit SwapEURCforUSDC(msg.sender, amountEURC, usdcOutWei);
        return usdcOutWei;
    }

    /**
     * @notice Add Liquidity to Spender Router Pool
     */
    function addLiquidity(uint256 eurcAmount) external payable {
        if (eurcAmount > 0) {
            IERC20(EURC_ADDRESS).transferFrom(msg.sender, address(this), eurcAmount);
        }
        emit LiquidityAdded(msg.sender, msg.value, eurcAmount);
    }

    function getReserves() external view returns (uint256 usdcReserveWei, uint256 eurcReserveUnits) {
        return (address(this).balance, IERC20(EURC_ADDRESS).balanceOf(address(this)));
    }

    function withdrawAll() external onlyOwner {
        if (address(this).balance > 0) {
            payable(owner).transfer(address(this).balance);
        }
        uint256 eBal = IERC20(EURC_ADDRESS).balanceOf(address(this));
        if (eBal > 0) {
            IERC20(EURC_ADDRESS).transfer(owner, eBal);
        }
    }
}
