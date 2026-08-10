import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle AppKit - Send USDC to a Wallet on Arc Testnet (JS runner)
 */

const kit = new AppKit();

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd";
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
  } catch (error) {
    console.error("📌 Circle AppKit Send Status:", error.message || error);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
