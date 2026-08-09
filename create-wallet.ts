import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer Controlled Wallet & WalletSet Creation Script
 * For Arc Testnet (Chain ID 5042002)
 * Built for ArcPulse Ecosystem by ProManas
 */

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d",
  entitySecret: process.env.CIRCLE_ENTITY_SECRET || "",
});

async function main() {
  console.log("🚀 Creating Circle WalletSet & Developer-Controlled Wallet on Arc Testnet...");
  
  const walletSetResponse = await client.createWalletSet({
    name: "My First Dev-Controlled Wallet Set",
  });

  const walletSet = walletSetResponse.data?.walletSet;
  if (!walletSet?.id) {
    throw new Error("Wallet set creation failed: no ID returned");
  }

  console.log(`✅ WalletSet Created! ID: ${walletSet.id}`);

  const walletResponse = await client.createWallets({
    walletSetId: walletSet.id,
    blockchains: ["ARC-TESTNET"], // Arc Testnet L1 Blockchain
    count: 1,
    accountType: "EOA", // Can be EOA or SCA
  });

  console.log("🎉 Wallet Set Response:", JSON.stringify(walletSetResponse.data, null, 2));
  console.log("🚀 Wallet Creation Response:", JSON.stringify(walletResponse.data, null, 2));
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
