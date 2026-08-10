import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

console.log("🚀 Executing Circle App Kit Swap (USDC → EURC on Arc Testnet)...");

async function runSwap() {
  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    if (!apiKey || apiKey === "YOUR_API_KEY" || !entitySecret || entitySecret === "YOUR_ENTITY_SECRET") {
      console.warn("⚠️ Please set CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET in your my-swap/.env file!");
    }

    const kit = new AppKit();
    
    // Circle Wallets Adapter
    const circleAdapter = createCircleWalletsAdapter({
      apiKey: apiKey || "YOUR_API_KEY",
      entitySecret: entitySecret || "YOUR_ENTITY_SECRET",
    });

    const walletAddress = process.env.USER_WALLET_ADDRESS || "YOUR_WALLET_ADDRESS";

    // 1. Circle Adapter Swap Example
    const result = await kit.swap({
      from: { adapter: circleAdapter, chain: "Arc_Testnet", address: walletAddress },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
    });

    console.log("✅ Swap Executed Successfully:");
    console.log(result);
  } catch (error) {
    console.error("❌ Swap Execution Error:", error);
  }
}

runSwap();
