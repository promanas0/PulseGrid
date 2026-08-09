const { AppKit } = require("@circle-fin/app-kit");
const { createViemAdapter, createViemAdapterFromPrivateKey } = require("@circle-fin/adapter-viem-v2");
const { arcTestnet } = require("viem/chains");

/**
 * Circle AppKit Swap using Viem V2 Adapter with official viem/chains arcTestnet (JS runner)
 * USDC -> EURC on Arc Testnet (Chain ID 5042002)
 * Supports Private Key Adapter & Browser/Wallet Adapters
 */

const kit = new AppKit();

async function main() {
  console.log("🚀 Initiating Circle AppKit Swap with Viem Adapter on Arc Testnet...");
  console.log(`📌 Chain: ${arcTestnet?.name || 'Arc Testnet'} (ID: ${arcTestnet?.id || 5042002})`);
  console.log("📌 Route: 1.00 USDC -> EURC");

  const privateKey = process.env.PRIVATE_KEY;
  const viemAdapter = privateKey
    ? createViemAdapterFromPrivateKey({ privateKey })
    : createViemAdapter();

  try {
    const result = await kit.swap({
      from: { adapter: viemAdapter, chain: "Arc_Testnet" },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
    });

    console.log("🎉 Swap Executed Successfully!", JSON.stringify(result, null, 2));
  } catch (error) {
    console.log("📌 Circle AppKit Viem Swap Status:", error.message || error);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
