import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle AppKit - Cross-Chain Bridge to Arc Testnet
 * Transfer 1.00 USDC from Solana Devnet -> Arc Testnet
 * Built for ArcPulse Ecosystem by ProManas
 */

const kit = new AppKit();

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";

const circleAdapter = createCircleWalletsAdapter({
  apiKey: apiKey,
  entitySecret: entitySecret,
});

async function main() {
  console.log("🚀 Initiating Circle Cross-Chain Bridge to Arc Testnet...");
  console.log("📌 Route: Solana_Devnet -> Arc_Testnet (1.00 USDC)");

  try {
    const result = await kit.bridge({
      from: { adapter: circleAdapter, chain: "Solana_Devnet" },
      to: { adapter: circleAdapter, chain: "Arc_Testnet" },
      amount: "1.00",
    });

    console.log("🎉 Bridge Transaction Result:", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("📌 Circle Bridge Status:", error?.message || error);
  }
}

main().catch((err: any) => {
  console.error("❌ Error:", err.message || err);
});
