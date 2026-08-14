import fs from 'fs';
import 'dotenv/config';
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer Controlled Wallets — Public Key Fetcher (TypeScript)
 * Fetches official Circle Public Key via SDK and saves to pubkey.pem
 * ArchPulse Ecosystem.
 */

const apiKey: string = process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd";
const entitySecret: string = process.env.CIRCLE_ENTITY_SECRET || "";

const client = initiateDeveloperControlledWalletsClient({
  apiKey,
  entitySecret,
});

async function main() {
  console.log("🚀 Fetching Circle Public Key via SDK API...");
  try {
    const response: any = await client.getPublicKey();
    const publicKey: string = response.data?.publicKey || response.data;

    if (publicKey) {
      fs.writeFileSync('pubkey.pem', publicKey, 'utf8');
      console.log("✅ Circle Public Key fetched and saved to pubkey.pem!");
      console.log("📌 Key Preview:", (typeof publicKey === 'string' ? publicKey : JSON.stringify(publicKey)).substring(0, 80) + "...");
    } else {
      console.log("📌 Response received:", response.data);
    }
  } catch (error: any) {
    console.error("❌ Error fetching public key:", error?.message || error);
  }
}

main();
