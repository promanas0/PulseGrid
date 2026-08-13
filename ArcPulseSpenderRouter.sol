// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcPulseSpenderRouter
 * @dev Official ERC-20 (USDC & EURC) & Native AMM DEX Spender Router for Arc Testnet (Chain ID 5042002).
 * ArcPulse Ecosystem.
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract ArcPulseSpenderRouter {
    string public name = "ArcPulse Universal Spender Router";
    string public symbol = "ARC-SPENDER-V4";
    address public owner;

    // Official Arc Testnet Token Addresses
    address public constant USDC_ADDRESS = 0x3600000000000000000000000000000000000000; // ERC-20 USDC (6 dec)
    address public constant EURC_ADDRESS = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a; // ERC-20 EURC (6 dec)

    // Exchange Rates (Scale: 1000)
    // 1 USDC = 0.924 EURC | 1 EURC = 1.082 USDC
    uint256 public rateUSDCtoEURC = 924;
    uint256 public rateEURCtoUSDC = 1082;

    event SwapUSDCforEURC(address indexed user, uint256 usdcIn, uint256 eurcOut);
    event SwapEURCforUSDC(address indexed user, uint256 eurcIn, uint256 usdcOut);
    event LiquidityAdded(address indexed provider, uint256 usdcAmount, uint256 eurcAmount);
    event RatesUpdated(uint256 newRateUSDCtoEURC, uint256 newRateEURCtoUSDC);

    modifier onlyOwner() {
        require(msg.sender == owner, "ArcPulseSpenderRouter: FORBIDDEN");
        _;
    }

    constructor() {
        owner = msg.sender;
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
     * @notice Swap ERC-20 USDC Tokens (6 decimals) for EURC Tokens (6 decimals)
     * Requires IERC20(USDC_ADDRESS).approve(address(this), amountUSDC) prior to swap.
     */
    function swapUSDCtoEURC(uint256 amountUSDC) external returns (uint256 eurcOut) {
        require(amountUSDC > 0, "Must specify USDC amount");

        // Pull ERC-20 USDC tokens from user using Spender approval
        bool pulled = IERC20(USDC_ADDRESS).transferFrom(msg.sender, address(this), amountUSDC);
        require(pulled, "ERC-20 USDC transferFrom failed. Check Spender approval.");

        // Calculate 6-decimal EURC output
        eurcOut = (amountUSDC * rateUSDCtoEURC) / 1000;

        uint256 dexEURCBal = IERC20(EURC_ADDRESS).balanceOf(address(this));
        if (dexEURCBal > 0) {
            uint256 toSend = eurcOut > dexEURCBal ? dexEURCBal : eurcOut;
            IERC20(EURC_ADDRESS).transfer(msg.sender, toSend);
        }

        emit SwapUSDCforEURC(msg.sender, amountUSDC, eurcOut);
        return eurcOut;
    }

    /**
     * @notice Swap Native USDC (18 decimals in wei) for EURC Tokens (6 decimals)
     * User sends native USDC as msg.value.
     */
    function swapNativeUSDCtoEURC() external payable returns (uint256 eurcOut) {
        uint256 usdcInWei = msg.value;
        require(usdcInWei > 0, "Must send native USDC");

        uint256 usdc6 = usdcInWei / 10**12;
        if (usdc6 == 0) usdc6 = 1;

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
     * @notice Swap EURC Tokens (6 decimals) for USDC Tokens (Native or ERC-20)
     */
    function swapEURCtoUSDC(uint256 amountEURC) external returns (uint256 usdcOut) {
        require(amountEURC > 0, "Must specify EURC amount");

        bool pulled = IERC20(EURC_ADDRESS).transferFrom(msg.sender, address(this), amountEURC);
        require(pulled, "EURC transferFrom failed. Check Spender approval.");

        usdcOut = (amountEURC * rateEURCtoUSDC) / 1000;
        uint256 usdcOutWei = (amountEURC * 10**12 * rateEURCtoUSDC) / 1000;

        uint256 dexUSDCBal = IERC20(USDC_ADDRESS).balanceOf(address(this));

        if (address(this).balance >= usdcOutWei) {
            payable(msg.sender).transfer(usdcOutWei);
        } else if (dexUSDCBal >= usdcOut) {
            IERC20(USDC_ADDRESS).transfer(msg.sender, usdcOut);
        } else {
            revert("DEX USDC Liquidity is empty");
        }

        emit SwapEURCforUSDC(msg.sender, amountEURC, usdcOut);
        return usdcOut;
    }

    /**
     * @notice Add Liquidity to Spender Router Pool
     */
    function addLiquidity(uint256 usdcAmount, uint256 eurcAmount) external payable {
        if (usdcAmount > 0) {
            IERC20(USDC_ADDRESS).transferFrom(msg.sender, address(this), usdcAmount);
        }
        if (eurcAmount > 0) {
            IERC20(EURC_ADDRESS).transferFrom(msg.sender, address(this), eurcAmount);
        }
        emit LiquidityAdded(msg.sender, usdcAmount > 0 ? usdcAmount : msg.value, eurcAmount);
    }

    /**
     * @notice Set swap rates (Only Owner)
     */
    function setRates(uint256 _rateUSDCtoEURC, uint256 _rateEURCtoUSDC) external onlyOwner {
        rateUSDCtoEURC = _rateUSDCtoEURC;
        rateEURCtoUSDC = _rateEURCtoUSDC;
        emit RatesUpdated(_rateUSDCtoEURC, _rateEURCtoUSDC);
    }

    /**
     * @notice Get pool reserve balances
     */
    function getReserves() external view returns (uint256 usdcErc20Units, uint256 nativeWei, uint256 eurcUnits) {
        return (IERC20(USDC_ADDRESS).balanceOf(address(this)), address(this).balance, IERC20(EURC_ADDRESS).balanceOf(address(this)));
    }

    /**
     * @notice Withdraw funds (Only Owner)
     */
    function withdrawAll() external onlyOwner {
        if (address(this).balance > 0) {
            payable(owner).transfer(address(this).balance);
        }
        uint256 uBal = IERC20(USDC_ADDRESS).balanceOf(address(this));
        if (uBal > 0) {
            IERC20(USDC_ADDRESS).transfer(owner, uBal);
        }
        uint256 eBal = IERC20(EURC_ADDRESS).balanceOf(address(this));
        if (eBal > 0) {
            IERC20(EURC_ADDRESS).transfer(owner, eBal);
        }
    }
}
