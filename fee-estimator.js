import { ethers } from "ethers";

/**
 * Arc Testnet Live RPC Gas Price & Fee History Estimator (ES Module)
 */

async function main() {
  console.log("🚀 Querying Live Arc Testnet Gas Price & Fee History via Ethers.js v6...");

  const rpcUrl = process.env.ARC_TESTNET_RPC_ALT || "https://rpc.testnet.arc.io";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    // Fetch current gas price
    const gasPriceHex = await provider.send("eth_gasPrice", []);
    const gasPriceWei = BigInt(gasPriceHex);
    const gasPriceGwei = ethers.formatUnits(gasPriceWei, "gwei");

    // Fetch fee history for the last 5 blocks
    const feeHistory = await provider.send("eth_feeHistory", [
      "0x5", // block count
      "latest", // newest block
      [25, 50, 75], // percentiles
    ]);

    console.dir({
      rpcUrl,
      gasPriceHex,
      gasPriceWei: gasPriceWei.toString(),
      gasPriceGwei: `${gasPriceGwei} Gwei`,
      feeHistory,
    }, { depth: null, colors: true });
  } catch (error) {
    console.error("❌ Gas Fee Estimation Failed:", error.message || error);
  }
}

main().catch(console.error);
