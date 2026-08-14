import 'dotenv/config';
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer Controlled Wallets — Wallet Creation Script
 * Creates WalletSet and Arc Testnet Smart Contract Account (SCA) Wallet
 * ArchPulse Ecosystem.
 */

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "204c43bfde66206f2e510a398f5725e6e5c7f215ae4ffab072d3da455b2980a5";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: apiKey,
  entitySecret: entitySecret
});

async function main() {
  console.log("🚀 Creating Circle WalletSet & Arc Testnet SCA Wallet...");
  try {
    const walletSet = await client.createWalletSet({
      name: "My Wallet Set",
    });

    console.log("✅ WalletSet Created ID:", walletSet.data?.walletSet?.id);

    const walletsResponse = await client.createWallets({
      blockchains: ["ARC-TESTNET"],
      count: 1,
      walletSetId: walletSet.data?.walletSet?.id ?? "",
      accountType: "SCA",
    });

    console.log("🎉 Created SCA Wallets Data:", JSON.stringify(walletsResponse.data, null, 2));
  } catch (error) {
    console.error("📌 Wallet Creation Status:", error.message || error);
  }
}

main();
