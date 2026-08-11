import 'dotenv/config';
import { AppKit } from "@circle-fin/app-kit";
import { ArcTestnet } from "@circle-fin/app-kit/chains";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle AppKit Swap using Circle Wallets Adapter (Developer-Controlled Wallets)
 * USDC -> EURC on Arc Testnet (Chain ID 5042002)
 * Built for ArcPulse Ecosystem by ProManas
 */

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  const walletAddress = process.env.USER_WALLET_ADDRESS || process.env.CIRCLE_WALLET_ADDRESS || "0xe45F6e7673F5451360ed11E05Ce7913d0104a432";

  if (!apiKey || apiKey.includes("your_api_key")) {
    throw new Error("CIRCLE_API_KEY missing in .env");
  }

  if (!entitySecret || entitySecret.includes("your_entity_secret")) {
    throw new Error("CIRCLE_ENTITY_SECRET missing in .env");
  }

  console.log("🚀 Initiating Circle AppKit Swap with Circle Wallets Adapter on Arc Testnet...");
  console.log(`📌 Chain: ${ArcTestnet.name || 'Arc Testnet'} (Chain ID: ${ArcTestnet.chainId || 5042002})`);
  console.log(`📌 Wallet Address: ${walletAddress}`);
  console.log("📌 Route: 1.00 USDC -> EURC");

  const kit = new AppKit();
  const adapter = createCircleWalletsAdapter({
    apiKey: apiKey,
    entitySecret: entitySecret,
  });

  try {
    const result = await kit.swap({
      from: { adapter, chain: ArcTestnet, address: walletAddress },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
      allowanceStrategy: "approve",
      config: {
        slippageBps: 300,
        allowanceStrategy: "approve",
      },
    });

    console.log("🎉 Swap Executed Successfully!", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.log("📌 Circle AppKit Swap Status:", error?.message || error);
  }
}

main().catch((err: any) => {
  console.error("❌ Error:", err.message || err);
});
