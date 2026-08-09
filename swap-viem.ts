import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapter } from "@circle-fin/adapter-viem-v2";

/**
 * Circle AppKit Swap using Viem V2 Adapter
 * USDC -> EURC on Arc Testnet (Chain ID 5042002)
 * Built for ArcPulse Ecosystem by ProManas
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
  } catch (error: any) {
    console.log("📌 Circle AppKit Viem Swap Status:", error?.message || error);
  }
}

main().catch((err: any) => {
  console.error("❌ Error:", err.message || err);
});
