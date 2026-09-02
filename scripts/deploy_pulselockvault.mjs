import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';
import solc from 'solc';

dotenv.config();

const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY is missing in .env");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log(`📡 Deploying PulseLockVault from address: ${wallet.address}`);

async function compileAndDeploy() {
  const source = fs.readFileSync('contracts/PulseLockVault.sol', 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'PulseLockVault.sol': {
        content: source,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  console.log("⚙️ Compiling PulseLockVault.sol...");
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    for (const error of output.errors) {
      if (error.severity === 'error') {
        console.error("❌ Compile error:", error.formattedMessage);
        hasError = true;
      } else {
        console.warn("⚠️ Warning:", error.formattedMessage);
      }
    }
    if (hasError) process.exit(1);
  }

  const contractData = output.contracts['PulseLockVault.sol']['PulseLockVault'];
  const abi = contractData.abi;
  const bytecode = contractData.evm.bytecode.object;

  console.log("🚀 Deploying PulseLockVault to Arc L1 Testnet...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  // Constructor parameter: authorized relayer address
  const authorizedRelayer = wallet.address;
  const contract = await factory.deploy(authorizedRelayer);
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log(`✅ PulseLockVault deployed successfully at: ${deployedAddress}`);
  console.log(`🔗 ArcScan Explorer: https://testnet.arcscan.app/address/${deployedAddress}`);

  // Save artifact
  if (!fs.existsSync('artifacts')) fs.mkdirSync('artifacts');
  fs.writeFileSync('artifacts/PulseLockVault.json', JSON.stringify({
    address: deployedAddress,
    abi: abi,
  }, null, 2));

  return deployedAddress;
}

compileAndDeploy().catch(console.error);
