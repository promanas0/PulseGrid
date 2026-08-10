import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";
import { createViemAdapterFromProvider, createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

console.log("🚀 Executing Circle App Kit Swap (USDC → EURC on Arc Testnet)...");

async function runSwap() {
  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    if (!apiKey || apiKey === "YOUR_API_KEY" || !entitySecret || entitySecret === "YOUR_ENTITY_SECRET") {
      console.warn("⚠️ Please set CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET in your my-swap/.env file!");
    }

    const kit = new AppKit();

    // 1. Circle Wallets Adapter Example (Developer-Controlled Wallets)
    const circleAdapter = createCircleWalletsAdapter({
      apiKey: apiKey || "YOUR_API_KEY",
      entitySecret: entitySecret || "YOUR_ENTITY_SECRET",
    });

    const walletAddress = process.env.USER_WALLET_ADDRESS || "YOUR_WALLET_ADDRESS";

    const circleResult = await kit.swap({
      from: { adapter: circleAdapter, chain: "Arc_Testnet", address: walletAddress },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
    });

    console.log("✅ Circle Adapter Swap Result:", circleResult);

  } catch (error) {
    console.error("❌ Swap Execution Error:", error);
  }
}

// 2. Viem / Provider Adapter Example (MetaMask / EIP-1193 Browser Wallets or Private Key)
export async function runViemSwap(providerOrPrivateKey: any) {
  try {
    const kit = new AppKit();
    const viemAdapter = typeof providerOrPrivateKey === 'string'
      ? createViemAdapterFromPrivateKey({ privateKey: providerOrPrivateKey })
      : await createViemAdapterFromProvider({ provider: providerOrPrivateKey });

    const result = await kit.swap({
      from: { adapter: viemAdapter, chain: "Arc_Testnet" },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
    });

    console.log("✅ Viem Adapter Swap Result:", result);
    return result;
  } catch (err) {
    console.error("❌ Viem Swap Error:", err);
  }
}

runSwap();
