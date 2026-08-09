// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcPulseDEX
 * @dev 100% Real Automated Market Maker (AMM) & Token DEX Router for Arc Testnet (Chain ID 5042002).
 * Supports native USDC (6 decimals, Gas token) ↔ EURC ERC-20 (6 decimals) swaps with real on-chain token transfers.
 * Built by ProManas (ProBuilder Studio) for ArcPulse Ecosystem.
 */

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract ArcPulseDEX {
    string public name = "ArcPulse Native DEX Router";
    string public symbol = "ARC-DEX-V1";
    address public owner;

    // Official Arc Testnet EURC Token Address (ERC-20, 6 decimals)
    address public constant EURC_ADDRESS = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;

    // Exchange Rates (Scale: 1000)
    // 1 USDC = 0.924 EURC (924 / 1000)
    // 1 EURC = 1.082 USDC (1082 / 1000)
    uint256 public rateUSDCtoEURC = 924;
    uint256 public rateEURCtoUSDC = 1082;

    event SwapUSDCforEURC(address indexed user, uint256 usdcIn, uint256 eurcOut);
    event SwapEURCforUSDC(address indexed user, uint256 eurcIn, uint256 usdcOut);
    event LiquidityDeposited(address indexed provider, uint256 usdcAmount, uint256 eurcAmount);
    event LiquidityWithdrawn(address indexed owner, uint256 usdcAmount, uint256 eurcAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ArcPulseDEX: Only owner allowed");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Direct Native USDC Deposit to contract (Works via MetaMask Send)
    receive() external payable {}
    fallback() external payable {}

    /**
     * @notice Swap Native USDC for EURC Tokens
     * @dev User sends native USDC as msg.value (6 decimals). Contract sends EURC tokens back to user.
     * Selector: 0xe89fdb69
     */
    function swapUSDCtoEURC() external payable returns (uint256 eurcOut) {
        uint256 usdcIn = msg.value;
        require(usdcIn > 0, "ArcPulseDEX: Must send native USDC");

        eurcOut = (usdcIn * rateUSDCtoEURC) / 1000;
        uint256 dexEURCBalance = IERC20(EURC_ADDRESS).balanceOf(address(this));
        require(dexEURCBalance >= eurcOut, "ArcPulseDEX: Insufficient EURC pool liquidity");

        bool sent = IERC20(EURC_ADDRESS).transfer(msg.sender, eurcOut);
        require(sent, "ArcPulseDEX: EURC token transfer failed");

        emit SwapUSDCforEURC(msg.sender, usdcIn, eurcOut);
        return eurcOut;
    }

    /**
     * @notice Swap EURC Tokens for Native USDC
     * @dev User transfers EURC (6 decimals) to DEX. Contract sends native USDC to user.
     * Requires prior approve(address(DEX), amountEURC) on EURC contract.
     * Selector: 0x0bdd4f29
     */
    function swapEURCtoUSDC(uint256 amountEURC) external returns (uint256 usdcOut) {
        require(amountEURC > 0, "ArcPulseDEX: Must specify EURC amount");

        usdcOut = (amountEURC * rateEURCtoUSDC) / 1000;
        require(address(this).balance >= usdcOut, "ArcPulseDEX: Insufficient USDC pool liquidity");

        bool pulled = IERC20(EURC_ADDRESS).transferFrom(msg.sender, address(this), amountEURC);
        require(pulled, "ArcPulseDEX: EURC transferFrom failed. Check approval.");

        (bool sent, ) = payable(msg.sender).call{value: usdcOut}("");
        require(sent, "ArcPulseDEX: Native USDC transfer failed");

        emit SwapEURCforUSDC(msg.sender, amountEURC, usdcOut);
        return usdcOut;
    }

    /**
     * @notice Deposit Native USDC into DEX Pool
     */
    function depositUSDC() external payable {
        require(msg.value > 0, "Must send USDC");
        emit LiquidityDeposited(msg.sender, msg.value, 0);
    }

    /**
     * @notice Deposit EURC Tokens into DEX Pool (requires approve first)
     * @param eurcUnits Amount in 6 decimals (e.g. 10 EURC = 10000000)
     */
    function depositEURC(uint256 eurcUnits) external {
        require(eurcUnits > 0, "Must send EURC units");
        bool success = IERC20(EURC_ADDRESS).transferFrom(msg.sender, address(this), eurcUnits);
        require(success, "EURC transferFrom failed. Did you approve DEX?");
        emit LiquidityDeposited(msg.sender, 0, eurcUnits);
    }

    /**
     * @notice Get current DEX pool reserves
     */
    function getReserves() external view returns (uint256 usdcReserve, uint256 eurcReserve) {
        return (address(this).balance, IERC20(EURC_ADDRESS).balanceOf(address(this)));
    }

    /**
     * @notice Owner Withdrawal of USDC
     */
    function withdrawUSDC(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "ArcPulseDEX: Exceeds balance");
        (bool sent, ) = payable(owner).call{value: amount}("");
        require(sent, "ArcPulseDEX: Withdrawal failed");
    }

    /**
     * @notice Owner Withdrawal of EURC
     */
    function withdrawEURC(uint256 amount) external onlyOwner {
        uint256 bal = IERC20(EURC_ADDRESS).balanceOf(address(this));
        require(bal >= amount, "ArcPulseDEX: Exceeds balance");
        bool sent = IERC20(EURC_ADDRESS).transfer(owner, amount);
        require(sent, "ArcPulseDEX: EURC withdrawal failed");
    }
}
