import { ethers } from "ethers";

/**
 * Ethers.js v6 Native USDC Transfer on Arc Testnet (ES Module)
 */

async function main() {
  console.log("🚀 Initializing Ethers.js v6 Transaction on Arc Testnet...");

  const rpcUrl = process.env.ARC_TESTNET_RPC_ALT || "https://rpc.testnet.arc.io";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const network = await provider.getNetwork();
  console.log(`📌 Connected Network: ${network.name} (Chain ID: ${network.chainId})`);
  if (network.chainId !== 5042002n) {
    console.warn(`⚠️ Warning: Provider connected to chain ID ${network.chainId}, expected 5042002n`);
  }

  const privateKey = process.env.PRIVATE_KEY;
  const recipient = process.env.DESTINATION_ADDRESS || "0xe45f8f8b39414578b871ed196edcba9d2822a432";

  if (!privateKey) {
    console.log("📌 Ethers Transaction Status: Missing PRIVATE_KEY in .env");
    console.log(`📌 Target Recipient: ${recipient}`);
    console.log(`📌 RPC Endpoint: ${rpcUrl}`);
    console.log("📌 Amount: 1 USDC (Native, 6 decimals)");
    return;
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  const tx = await wallet.sendTransaction({
    to: recipient,
    value: ethers.parseUnits("1", 6), // 1 USDC via native send
    maxFeePerGas: ethers.parseUnits("20", "gwei"),
  });

  console.log("🎉 Transaction Submitted!", {
    hash: tx.hash,
    from: wallet.address,
    to: recipient,
    explorerUrl: `https://testnet.arcscan.app/tx/${tx.hash}`
  });
}

main().catch(console.error);
