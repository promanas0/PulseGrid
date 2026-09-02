import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const PULSE_AI_AGENT_ADDRESS = '0xB14040166Dc90e345333c99dC208A539801D595C';
const PULSE_LOCK_VAULT_ADDRESS = '0xE36687501B69bb94af4c8de36D0cF7178D256347';
const ERC20_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const ERC20_EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

const PULSE_AI_AGENT_ABI = [
  "function executeSwapByAgent(address user, address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external",
  "function executeTransferByAgent(address user, address payable recipient, uint256 amount, string calldata memo) external",
  "function executeBatchTransferByAgent(address user, address payable recipient, uint256 count, uint256 amountPerTx, string calldata memo) external",
  "function executeStakeByAgent(address user, uint8 validatorId, uint256 amount) external",
  "function getUserVaultBalance(address user) external view returns (uint256)",
  "function authorizedAgents(address agent) external view returns (bool)"
];

const PULSE_LOCK_VAULT_ABI = [
  "function lockUSDC(uint256 durationInSeconds, string calldata reason) external payable returns (uint256)",
  "function executeLockByAgent(address user, uint256 durationInSeconds, string calldata reason) external payable returns (uint256)",
  "function withdrawUnlocked(uint256 lockIndex) external",
  "function executeUnlockByAgent(address user, uint256 lockIndex) external",
  "function getUserLockSummary(address user) external view returns (uint256 totalLocked, uint256 activeLocksCount, uint256 unlockableAmount)"
];

let provider = null;
let relayerWallet = null;
let agentContract = null;
let lockContract = null;

if (process.env.PRIVATE_KEY) {
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    relayerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    agentContract = new ethers.Contract(PULSE_AI_AGENT_ADDRESS, PULSE_AI_AGENT_ABI, relayerWallet);
    lockContract = new ethers.Contract(PULSE_LOCK_VAULT_ADDRESS, PULSE_LOCK_VAULT_ABI, relayerWallet);
    console.log(`🤖 AI Agent Relayer initialized: ${relayerWallet.address}`);
    console.log(`🏛️ PulseAIAgent Contract: ${PULSE_AI_AGENT_ADDRESS}`);
    console.log(`🔒 PulseLockVault Contract: ${PULSE_LOCK_VAULT_ADDRESS}`);
  } catch (e) {
    console.warn('⚠️ Could not initialize AI Agent Relayer:', e.message);
  }
}

const server = createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  // =========================================================================
  // API ROUTE: /api/agent-relayer (100% ZERO-POPUP ON-CHAIN AUTONOMOUS EXECUTION)
  // =========================================================================
  if (urlPath === '/api/agent-relayer' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { action, user, amount, tokenIn, tokenOut, recipient, count, amountPerTx, validatorId, durationSeconds, reason, lockIndex } = payload;

        if (!user || !ethers.isAddress(user)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Valid user address is required' }));
          return;
        }

        if (!agentContract || !relayerWallet) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'AI Agent Relayer not configured with PRIVATE_KEY on server' }));
          return;
        }

        console.log(`🚀 Executing Autonomous Auto-Pay for ${user}: Action = ${action}, Amount = ${amount}`);

        let tx;
        const gasOptions = { gasLimit: 400000 };
        if (action === 'SWAP') {
          const amountWei = ethers.parseEther(amount.toString());
          const tokenInAddr = tokenIn === 'EURC' ? ERC20_EURC_ADDRESS : ERC20_USDC_ADDRESS;
          const tokenOutAddr = tokenOut === 'EURC' ? ERC20_EURC_ADDRESS : ERC20_USDC_ADDRESS;

          tx = await agentContract.executeSwapByAgent(
            user,
            tokenInAddr,
            tokenOutAddr,
            amountWei,
            0,
            gasOptions
          );
        } else if (action === 'SEND') {
          const amountWei = ethers.parseEther(amount.toString());
          tx = await agentContract.executeTransferByAgent(
            user,
            recipient,
            amountWei,
            "AI Copilot Autonomous Transfer",
            gasOptions
          );
        } else if (action === 'BATCH') {
          const amountPerTxWei = ethers.parseEther(amountPerTx.toString());
          tx = await agentContract.executeBatchTransferByAgent(
            user,
            recipient,
            count || 10,
            amountPerTxWei,
            "AI Copilot Autonomous Batch Execution",
            { gasLimit: 2000000 }
          );
        } else if (action === 'STAKE') {
          const amountWei = ethers.parseEther(amount.toString());
          tx = await agentContract.executeStakeByAgent(
            user,
            validatorId || 1,
            amountWei,
            gasOptions
          );
        } else if (action === 'LOCK_USDC') {
          const amountWei = ethers.parseEther(amount.toString());
          // 1. Deduct on-chain from PulseAIAgent Vault
          try {
            const deductTx = await agentContract.executeTransferByAgent(
              user,
              relayerWallet.address,
              amountWei,
              "AI Vault Timelock Deduction",
              gasOptions
            );
            await deductTx.wait(1);
          } catch (deductErr) {
            console.warn("Vault balance deduction notice:", deductErr.message);
          }

          // 2. Lock on-chain in PulseLockVault
          tx = await lockContract.executeLockByAgent(
            user,
            durationSeconds || 86400,
            reason || "AI Copilot Savings Lock",
            { value: amountWei, gasLimit: 400000 }
          );
        } else if (action === 'UNLOCK_USDC') {
          const userLocks = await lockContract.getUserLocks(user).catch(() => []);
          const now = Math.floor(Date.now() / 1000);
          let matureIndex = -1;
          let minRemaining = Infinity;
          let activeCount = 0;

          for (let i = 0; i < userLocks.length; i++) {
            const l = userLocks[i];
            if (!l.withdrawn) {
              activeCount++;
              const unlockTs = Number(l.unlockTimestamp);
              if (now >= unlockTs) {
                matureIndex = i;
                break;
              } else {
                const diff = unlockTs - now;
                if (diff < minRemaining) minRemaining = diff;
              }
            }
          }

          if (matureIndex === -1) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              notMatureYet: true,
              activeLocksCount: activeCount,
              nextUnlockIn: minRemaining === Infinity ? 0 : minRemaining,
              message: "Tokens still locked under timelock. Maturity period has not ended yet."
            }));
            return;
          }

          tx = await lockContract.executeUnlockByAgent(
            user,
            matureIndex,
            gasOptions
          );
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Unknown action: ${action}` }));
          return;
        }

        console.log(`📡 Broadcasted on Arc L1! Hash: ${tx.hash}`);
        const receipt = await tx.wait(1);
        console.log(`✅ Confirmed on Block #${receipt.blockNumber}!`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          txHash: receipt.hash || tx.hash,
          blockNumber: receipt.blockNumber,
          relayer: relayerWallet.address
        }));
      } catch (err) {
        console.error('❌ Relayer Execution Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: err.reason || err.shortMessage || err.message || 'On-chain execution failed'
        }));
      }
    });
    return;
  }

  // =========================================================================
  // STATIC ASSET SERVING
  // =========================================================================
  let filePath = join(process.cwd(), urlPath === '/' ? 'index.html' : urlPath);
  
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(process.cwd(), 'index.html');
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const data = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Server Error: ${err.message}`);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`ArchPulse DApp & AI Agent Relayer running on port ${PORT}`);
});
