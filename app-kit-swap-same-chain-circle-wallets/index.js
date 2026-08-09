import { createCircleAppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle App Kit - Same Chain USDC/EURC Swap on Arc Testnet
 * Powered by ArcPulse Ecosystem
 */

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";

async function main() {
  console.log("🚀 Initializing Circle App Kit Swap (Same Chain Arc Testnet)...");

  try {
    const circleAdapter = createCircleWalletsAdapter({
      apiKey: apiKey,
    });

    const appKit = createCircleAppKit({
      adapters: [circleAdapter],
    });

    console.log("✅ Circle App Kit & Circle Wallets Adapter initialized successfully!");

    const swapResult = await appKit.swap({
      from: { adapter: circleAdapter, chain: "Arc_Testnet" },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
    });

    console.log("🎉 Swap Result:", JSON.stringify(swapResult, null, 2));
  } catch (error) {
    console.log("📌 Circle App Kit Adapter status:", error.message || error);
  }
}

main().catch(console.error);
