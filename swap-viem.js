const { AppKit } = require("@circle-fin/app-kit");
const { createViemAdapter } = require("@circle-fin/adapter-viem-v2");

/**
 * Circle AppKit Swap using Viem V2 Adapter (JS runner)
 * USDC -> EURC on Arc Testnet (Chain ID 5042002)
 */

const kit = new AppKit();

async function main() {
  console.log("🚀 Initiating Circle AppKit Swap with Viem Adapter on Arc Testnet...");
  console.log("📌 Route: 1.00 USDC -> EURC");

  const viemAdapter = createViemAdapter();

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
