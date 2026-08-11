import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer Controlled Wallet Creation Script
 * For Arc Testnet (Chain ID 5042002)
 * ArcPulse Ecosystem.
 */
const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd";
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

  // Create Arc Testnet SCA (Smart Contract Account) Wallet
  const arcWalletResponse = await client.createWallets({
    walletSetId: walletSetId,
    blockchains: ["ARC-TESTNET"],
    count: 1,
    accountType: "SCA",
  });

  console.log("🎉 Arc wallet created successfully!");
  console.log("Arc wallet:", JSON.stringify(arcWalletResponse.data, null, 2));
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
