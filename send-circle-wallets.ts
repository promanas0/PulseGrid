import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";
import type { SendParams } from "@circle-fin/app-kit";

/**
 * Circle AppKit Send USDC using Circle Wallets Adapter on Arc Testnet
 * Built for ArcPulse Ecosystem by ProManas
 */

const kit = new AppKit();

async function main() {
  console.log("🚀 Initiating Circle AppKit Send with Circle Wallets Adapter (Arc Testnet)...");

  const sourceWalletAddress = process.env.CIRCLE_WALLET_ADDRESS || "YOUR_SOURCE_WALLET_ADDRESS";
  const recipientAddress = process.env.DESTINATION_ADDRESS || "0xe45f8f8b39414578b871ed196edcba9d2822a432";

  const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "YOUR_ENTITY_SECRET";

  const adapter = createCircleWalletsAdapter({
    apiKey,
    entitySecret,
  });

  const sendParams: SendParams = {
    from: {
      adapter,
      chain: "Arc_Testnet",
      address: sourceWalletAddress,
    },
    to: recipientAddress,
    amount: "1.00",
    token: "USDC",
  };

  try {
    const estimate = await kit.estimateSend(sendParams);
    const result = await kit.send(sendParams);

    console.dir({ estimate, result }, { depth: null, colors: true });
  } catch (error: any) {
    console.log("📌 Circle AppKit Send Status:", error?.message || error);
  }
}

main().catch(console.error);
