import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle App Kit - Send USDC via Circle Wallets Adapter on Arc Testnet
 * Built for ArcPulse Ecosystem by ProManas
 */

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: apiKey,
  entitySecret: entitySecret,
});

async function main() {
  console.log("🚀 Initializing Circle AppKit Send with Circle Wallets (Arc Testnet)...");
  console.log("📌 Chain ID: 5042002 (Arc Testnet)");

  try {
    const recipient = process.env.DESTINATION_ADDRESS || "0xe45f8f8b39414578b871ed196edcba9d2822a432";
    console.log(`✅ Client initialized! Target Recipient: ${recipient}`);
  } catch (error: any) {
    console.error("📌 AppKit Send Status:", error?.message || error);
  }
}

main().catch(console.error);
