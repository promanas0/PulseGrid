import 'dotenv/config';
import fs from 'fs';
import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

// Load .env variables manually
if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf-8');
  envConfig.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length > 1) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key && !key.startsWith('#')) {
        process.env[key] = value;
      }
    }
  });
}

/**
 * Circle AppKit Send USDC using Circle Wallets Adapter (JS runner)
 */

const kit = new AppKit();

async function main() {
  console.log("🚀 Initiating Circle AppKit Send with Circle Wallets Adapter (Arc Testnet)...");

  const sourceWalletAddress = process.env.CIRCLE_WALLET_ADDRESS || "YOUR_SOURCE_WALLET_ADDRESS";
  const recipientAddress = process.env.DESTINATION_ADDRESS || "0xe45f8f8b39414578b871ed196edcba9d2822a432";

  const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd";
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "YOUR_ENTITY_SECRET";

  const adapter = createCircleWalletsAdapter({
    apiKey,
    entitySecret,
  });

  const sendParams = {
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
  } catch (error) {
    console.log("📌 Circle AppKit Send Status:", error.message || error);
  }
}

main().catch(console.error);
