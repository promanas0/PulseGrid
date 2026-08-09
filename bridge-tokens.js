import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle AppKit - Cross-Chain CCTP Bridge to Arc Testnet (ES Module)
 */

const kit = new AppKit();

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";

const circleAdapter = createCircleWalletsAdapter({
  apiKey: apiKey,
  entitySecret: entitySecret,
});

async function main() {
  console.log("🚀 Initiating Circle Cross-Chain CCTP Bridge to Arc Testnet...");
  console.log("📌 Route: Solana_Devnet -> Arc_Testnet (1.00 USDC)");

  try {
    const result = await kit.bridge({
      from: { adapter: circleAdapter, chain: "Solana_Devnet" },
      to: { adapter: circleAdapter, chain: "Arc_Testnet" },
      amount: "1.00",
    });

    console.log(`📌 CCTP Bridge Status: ${result?.state || 'COMPLETE'}`);

    if (result?.steps && Array.isArray(result.steps)) {
      console.log("\n🔄 CCTP Step-by-Step Progress Trace:");
      result.steps.forEach((step, index) => {
        const icon = step.state === "success" ? "✅" : step.state === "error" ? "❌" : "⏳";
        console.log(`  ${index + 1}. ${icon} Step: ${step.name} | Status: ${step.state}`);
        if (step.txHash) console.log(`     Tx Hash: ${step.txHash}`);
        if (step.error) console.log(`     Error Details: ${step.error}`);
      });
    }

    console.dir({ result }, { depth: null, colors: true });
  } catch (error) {
    console.error("📌 Circle Bridge Execution Result:", error.message || error);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
