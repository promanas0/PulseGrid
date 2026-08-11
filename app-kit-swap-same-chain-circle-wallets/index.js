import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle AppKit - Same Chain USDC -> EURC Swap on Arc Testnet
 * ArcPulse Ecosystem.
 */

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: apiKey,
  entitySecret: entitySecret,
});

async function main() {
  console.log("🚀 Initializing Circle AppKit Swap (Same Chain Arc Testnet)...");

  try {
    const sourceWalletAddress = process.env.SOURCE_WALLET_ADDRESS || "YOUR_SOURCE_WALLET_ADDRESS";

    console.log("✅ Circle Wallets Client & Adapter Initialized!");
    console.log("📌 Target Chain: Arc Testnet (5042002)");
    console.log("📌 Swap Pair: 1.00 USDC -> EURC");

  } catch (error) {
    console.error("❌ Circle AppKit Error:", error.message || error);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
