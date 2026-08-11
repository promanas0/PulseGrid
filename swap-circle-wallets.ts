import 'dotenv/config';
import { AppKit, type SwapParams } from "@circle-fin/app-kit";
import { ArcTestnet } from "@circle-fin/app-kit/chains";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle AppKit Swap using Circle Wallets Adapter with explicit SwapParams typing
 * USDC -> EURC on Arc Testnet (Chain ID 5042002)
 * Built for ArcPulse Ecosystem by ProManas
 */

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  const sourceWalletAddress = process.env.USER_WALLET_ADDRESS || process.env.CIRCLE_WALLET_ADDRESS || "0xe45F6e7673F5451360ed11E05Ce7913d0104a432";

  if (!apiKey || apiKey.includes("your_api_key")) {
    throw new Error("CIRCLE_API_KEY missing in .env");
  }

  if (!entitySecret || entitySecret.includes("your_entity_secret")) {
    throw new Error("CIRCLE_ENTITY_SECRET missing in .env");
  }

  console.log("🚀 Initiating Circle AppKit Swap with Circle Wallets Adapter on Arc Testnet...");
  console.log(`📌 Chain: ${ArcTestnet.name || 'Arc Testnet'} (Chain ID: ${ArcTestnet.chainId || 5042002})`);
  console.log(`📌 Wallet Address: ${sourceWalletAddress}`);
  console.log("📌 Route: 7 EURC -> USDC");

  const kit = new AppKit();
  const adapter = createCircleWalletsAdapter({
    apiKey: apiKey,
    entitySecret: entitySecret,
  });

  const swapParams: SwapParams = {
    from: {
      adapter,
      chain: ArcTestnet,
      address: sourceWalletAddress,
    },
    tokenIn: "EURC",   // EURC -> USDC swap
    tokenOut: "USDC",
    amountIn: "7",     // string amount
    config: {
      ...(process.env.KIT_KEY ? { kitKey: process.env.KIT_KEY } : {}),
      allowanceStrategy: "approve", // SCA ke liye
    },
  } as any;

  try {
    // Step 1: Swap execute karo
    const result: any = await kit.swap(swapParams);
    console.log("TX Hash:", result?.txHash || result?.hash);

    // Step 2: Swap COMPLETE hone ka wait karo (if KIT_KEY present)
    if (result && process.env.KIT_KEY) {
      console.log("⏳ Waiting for Swap to COMPLETE...");
      const status: any = await kit.waitForSwap({
        result,
        kitKey: process.env.KIT_KEY,
      } as any);
      console.log("Final status:", status?.progress?.status || status?.status || "COMPLETED");
    }

    console.log("🎉 Swap Executed Successfully!", JSON.stringify(result, null, 2));
  } catch (error: any) {
    if (error?.code === 4001 || error?.cause?.code === 4001 || error?.message?.includes("User denied") || error?.message?.includes("rejected")) {
      console.log("User ne cancel kiya"); // ❌ User cancelled transaction in wallet
    } else {
      console.log("📌 Circle AppKit Swap Status:", error?.message || error);
    }
  }
}

main().catch((err: any) => {
  console.error("❌ Error:", err.message || err);
});
