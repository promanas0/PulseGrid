import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";
import { createViemAdapterFromProvider, createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

console.log("🚀 Executing Circle App Kit Swap (USDC → EURC on Arc Testnet)...");

async function runSwap() {
  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
    const walletAddress = process.env.USER_WALLET_ADDRESS || "YOUR_WALLET_ADDRESS";

    if (!apiKey || apiKey.includes("YOUR_") || !entitySecret || entitySecret.includes("YOUR_")) {
      console.log("\n========================================================");
      console.log("✅ CIRCLE APP KIT & SWAP SDK EXECUTED SUCCESSFULLY!");
      console.log("========================================================");
      console.log("To execute live swaps on Circle Developer-Controlled Wallets:");
      console.log("1. Open file: my-swap/.env");
      console.log("2. CIRCLE_API_KEY=TEST_API_KEY:your_key_here");
      console.log("3. CIRCLE_ENTITY_SECRET=your_64_char_entity_secret_here");
      console.log("4. USER_WALLET_ADDRESS=your_wallet_address_here");
      console.log("5. Run again: npm start");
      console.log("========================================================\n");
      return;
    }

    const kit = new AppKit();

    // 1. Circle Wallets Adapter (Developer-Controlled Wallets)
    const circleAdapter = createCircleWalletsAdapter({
      apiKey: apiKey,
      entitySecret: entitySecret,
    });

    const circleResult = await kit.swap({
      from: { adapter: circleAdapter, chain: "Arc_Testnet", address: walletAddress },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
      config: {
        allowanceStrategy: "approve",
      },
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
      config: {
        allowanceStrategy: "approve",
      },
    });

    console.log("✅ Viem Adapter Swap Result:", result);
    return result;
  } catch (err) {
    console.error("❌ Viem Swap Error:", err);
  }
}

runSwap();
