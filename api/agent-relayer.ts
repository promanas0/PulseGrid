import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const PULSE_AI_AGENT_ADDRESS = '0x904549702043e9cAAe34af58680c424Adaccc720';
const PULSE_LOCK_VAULT_ADDRESS = '0xE06900028a2B4c35123ff167e08865b88C6F1E3c';
const ERC20_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const ERC20_EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

const PULSE_AI_AGENT_ABI = [
  "function executeSwapByAgent(address user, address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external",
  "function executeTransferByAgent(address user, address payable recipient, uint256 amount, string calldata memo) external",
  "function executeBatchTransferByAgent(address user, address payable recipient, uint256 count, uint256 amountPerTx, string calldata memo) external",
  "function executeStakeByAgent(address user, uint8 validatorId, uint256 amount) external",
  "function getUserVaultBalance(address user) external view returns (uint256)"
];

const PULSE_LOCK_VAULT_ABI = [
  "function lockUSDC(uint256 durationInSeconds, string calldata reason) external payable returns (uint256)",
  "function executeLockByAgent(address user, uint256 durationInSeconds, string calldata reason) external payable returns (uint256)",
  "function withdrawUnlocked(uint256 lockIndex) external",
  "function executeUnlockByAgent(address user, uint256 lockIndex) external",
  "function getUserLockSummary(address user) external view returns (uint256 totalLocked, uint256 activeLocksCount, uint256 unlockableAmount)"
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action, user, amount, tokenIn, tokenOut, recipient, count, amountPerTx, validatorId, durationSeconds, reason, lockIndex } = req.body || {};

    if (!user || !ethers.isAddress(user)) {
      return res.status(400).json({ error: 'Valid user address is required' });
    }

    if (!process.env.PRIVATE_KEY) {
      return res.status(500).json({ error: 'AI Agent Relayer PRIVATE_KEY not configured' });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const relayerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const agentContract = new ethers.Contract(PULSE_AI_AGENT_ADDRESS, PULSE_AI_AGENT_ABI, relayerWallet);
    const lockContract = new ethers.Contract(PULSE_LOCK_VAULT_ADDRESS, PULSE_LOCK_VAULT_ABI, relayerWallet);

    let tx;
    if (action === 'SWAP') {
      const amountWei = ethers.parseEther(amount.toString());
      const tokenInAddr = tokenIn === 'EURC' ? ERC20_EURC_ADDRESS : ERC20_USDC_ADDRESS;
      const tokenOutAddr = tokenOut === 'EURC' ? ERC20_EURC_ADDRESS : ERC20_USDC_ADDRESS;

      tx = await agentContract.executeSwapByAgent(
        user,
        tokenInAddr,
        tokenOutAddr,
        amountWei,
        0
      );
    } else if (action === 'SEND') {
      const amountWei = ethers.parseEther(amount.toString());
      tx = await agentContract.executeTransferByAgent(
        user,
        recipient,
        amountWei,
        "AI Copilot Autonomous Transfer"
      );
    } else if (action === 'BATCH') {
      const amountPerTxWei = ethers.parseEther(amountPerTx.toString());
      tx = await agentContract.executeBatchTransferByAgent(
        user,
        recipient,
        count || 10,
        amountPerTxWei,
        "AI Copilot Autonomous Batch Execution"
      );
    } else if (action === 'STAKE') {
      const amountWei = ethers.parseEther(amount.toString());
      tx = await agentContract.executeStakeByAgent(
        user,
        validatorId || 1,
        amountWei
      );
    } else if (action === 'LOCK_USDC') {
      const amountWei = ethers.parseEther(amount.toString());
      tx = await lockContract.executeLockByAgent(
        user,
        durationSeconds || 86400,
        reason || "AI Copilot Savings Lock",
        { value: amountWei }
      );
    } else if (action === 'UNLOCK_USDC') {
      tx = await lockContract.executeUnlockByAgent(
        user,
        lockIndex !== undefined ? lockIndex : 0
      );
    } else {
      return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    const receipt = await tx.wait(1);

    return res.status(200).json({
      success: true,
      txHash: receipt.hash || tx.hash,
      blockNumber: receipt.blockNumber,
      relayer: relayerWallet.address
    });
  } catch (err: any) {
    console.error('Relayer Error:', err);
    return res.status(500).json({
      error: err.reason || err.shortMessage || err.message || 'On-chain execution failed'
    });
  }
}
