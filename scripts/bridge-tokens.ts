import { AppKit, type BridgeResult } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle AppKit - Cross-Chain CCTP Bridge to Arc Testnet
 * Transfer 1.00 USDC from Ethereum Sepolia -> Arc Testnet
 * Handles Step-by-Step CCTP Inspection & Selective Retry on Error
 * ArchPulse Ecosystem.
 */

const kit = new AppKit();

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";

const sourceAdapter = createCircleWalletsAdapter({
  apiKey,
  entitySecret,
});

const destinationAdapter = sourceAdapter;

/**
 * Helper function to locate the specific step that encountered an error
 */
const findErrorStep = (result: BridgeResult | any) => {
  if (result?.state === "error" || result?.state === "FAILED") {
    return result?.steps?.find((step: any) => step?.state === "error" || step?.status === "FAILED" || step?.error);
  }
  return null;
};

async function main() {
  console.log("🚀 Initiating Circle Cross-Chain CCTP Bridge to Arc Testnet...");
  console.log("📌 Route: Ethereum_Sepolia -> Arc_Testnet (1.00 USDC)");

  try {
    const result: any = await kit.bridge({
      from: { adapter: sourceAdapter, chain: "Ethereum_Sepolia" },
      to: { adapter: destinationAdapter, chain: "Arc_Testnet" },
      amount: "1.00",
    });

    console.log("📌 INITIAL RESULT");
    console.dir(result, { depth: null, colors: true });

    if (result?.state === "error" || result?.state === "FAILED") {
      const errorStep = findErrorStep(result);
      console.warn("⚠️ Bridge transfer failed at step:", errorStep?.name || "unknown");

      const errorMessage = errorStep?.errorMessage || errorStep?.error?.message || "";
      console.warn("📌 Error Details:", errorMessage || "No detailed error message");

      // Selective retry if the error is recoverable (e.g. gas allowance, temporary RPC failure, attestation delay)
      if (
        !errorMessage || 
        errorMessage.includes("gas required exceeds allowance") ||
        errorMessage.includes("nonce") ||
        errorMessage.includes("timeout")
      ) {
        console.log("🔄 Triggering kit.retry() with updated destination adapter...");
        const retryResult: any = await (kit as any).retry(result, {
          from: sourceAdapter,
          to: destinationAdapter,
        });
        console.log("📌 RETRY RESULT");
        console.dir(retryResult, { depth: null, colors: true });
      }
    } else {
      console.log("✅ Bridge transfer completed successfully!");
    }

  } catch (error: any) {
    console.error("📌 Circle Bridge Execution Status:", error?.message || error);
  }
}

main().catch((err: any) => {
  console.error("❌ Error:", err.message || err);
});
