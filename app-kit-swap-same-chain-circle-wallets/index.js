import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle AppKit - Same Chain USDC -> EURC Swap on Arc Testnet
 * Powered by ArcPulse Ecosystem by ProManas
 */

const kit = new AppKit();

const sourceWalletAddress = process.env.SOURCE_WALLET_ADDRESS || "YOUR_SOURCE_WALLET_ADDRESS";

const adapter = createCircleWalletsAdapter({
  apiKey: process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d",
  entitySecret: process.env.CIRCLE_ENTITY_SECRET || "",
});

const swapParams = {
  from: {
    adapter,
    chain: "Arc_Testnet",
    address: sourceWalletAddress,
  },
  tokenIn: "USDC",
  tokenOut: "EURC",
  amountIn: "1.00",
  config: {
    kitKey: process.env.KIT_KEY,
  },
};

async function main() {
  console.log("🚀 Initiating Circle AppKit Swap Estimation on Arc Testnet...");
  try {
    const estimate = await kit.estimateSwap(swapParams);
    console.dir({ estimate }, { depth: null, colors: true });

    console.log("🚀 Executing Circle AppKit Swap...");
    const result = await kit.swap(swapParams);
    console.dir({ result }, { depth: null, colors: true });
  } catch (error) {
    console.error("📌 Circle AppKit Swap Status:", error?.message || error);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
