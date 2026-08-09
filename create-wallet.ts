import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer Controlled Wallet Creation Script
 * For Arc Testnet (Chain ID 5042002)
 * Built for ArcPulse Ecosystem by ProManas
 */
const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: apiKey,
  entitySecret: entitySecret,
});

async function main() {
  console.log("🚀 Initiating Circle Arc Testnet Wallet Creation...");

  let walletSetId = process.env.CIRCLE_WALLET_SET_ID || process.env.WALLET_SET_ID;

  if (!walletSetId || walletSetId.includes("YOUR_")) {
    console.log("📌 Creating a new WalletSet...");
    const walletSetResponse = await client.createWalletSet({
      name: "My First Dev-Controlled Wallet Set",
    });
    walletSetId = walletSetResponse.data?.walletSet?.id;
    console.log("✅ New WalletSet Created ID:", walletSetId);
  } else {
    console.log("📌 Using existing WalletSet ID:", walletSetId);
  }

  if (!walletSetId) {
    throw new Error("WalletSet ID missing. Check your Circle API credentials and entity secret.");
  }

  // Create Arc Testnet Wallet
  const arcWalletResponse = await client.createWallets({
    walletSetId: walletSetId,
    blockchains: ["ARC-TESTNET"],
    count: 1,
  });

  console.log("🎉 Arc wallet created successfully!");
  console.log("Arc wallet:", JSON.stringify(arcWalletResponse.data, null, 2));
}

main().catch((err: any) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
