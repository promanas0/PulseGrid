import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle AppKit - Send USDC to a Wallet on Arc Testnet
 * Built for ArcPulse Ecosystem by ProManas
 */

const kit = new AppKit();

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";
const recipientAddress = process.env.DESTINATION_ADDRESS || "0xe45f8f8b39414578b871ed196edcba9d2822a432";

const adapter = createCircleWalletsAdapter({
  apiKey: apiKey,
  entitySecret: entitySecret,
});

async function main() {
  console.log("🚀 Initiating Circle AppKit Send on Arc Testnet...");
  console.log(`📌 Recipient Address: ${recipientAddress}`);
  console.log("📌 Token: USDC | Amount: 1.00");

  try {
    const result = await kit.send({
      from: { adapter, chain: "Arc_Testnet" },
      to: recipientAddress,
      amount: "1.00",
      token: "USDC",
    });

    console.log("🎉 AppKit Send Result:", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("📌 Circle AppKit Send Status:", error?.message || error);
  }
}

main().catch((err: any) => {
  console.error("❌ Error:", err.message || err);
});
