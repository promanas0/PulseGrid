import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer Controlled Wallet Creation Script
 * For Arc Testnet (Chain ID 5042002)
 * Built for ArcPulse Ecosystem by ProManas
 */

const apiKey = process.env.API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
const entitySecret = process.env.ENTITY_SECRET || "";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: apiKey,
  entitySecret: entitySecret,
});

async function createWallet() {
  console.log("🚀 Initiating Circle Developer Controlled Wallet on Arc Testnet...");
  try {
    const response = await client.createWallets({
      accountType: "SCA",
      blockchains: ["ARC-TESTNET"],
      count: 1,
      walletSetId: process.env.WALLET_SET_ID || "",
    });

    console.log("✅ Circle Wallet Created Successfully!");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Error creating Circle wallet:", error);
  }
}

createWallet();
