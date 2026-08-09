import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

/**
 * Circle AppKit - Cross-Chain CCTP Bridge to Arc Testnet
 * Transfer 1.00 USDC from Ethereum Sepolia -> Arc Testnet
 * Handles Step-by-Step CCTP Inspection (Approve, Burn, FetchAttestation, Mint)
 * Built for ArcPulse Ecosystem by ProManas
 */

const kit = new AppKit();

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";

const sourceAdapter = createCircleWalletsAdapter({
  apiKey,
  entitySecret,
});

const destinationAdapter = sourceAdapter;

async function main() {
  console.log("🚀 Initiating Circle Cross-Chain CCTP Bridge to Arc Testnet...");
  console.log("📌 Route: Ethereum_Sepolia -> Arc_Testnet (1.00 USDC)");

  try {
    const result: any = await kit.bridge({
      from: { adapter: sourceAdapter, chain: "Ethereum_Sepolia" },
      to: { adapter: destinationAdapter, chain: "Arc_Testnet" },
      amount: "1.00",
    });

    console.log("Bridge transfer state:", result?.state);
    console.log("Steps:", result?.steps);

    // Helper function to find specific CCTP steps
    const getStep = (stepName: string) =>
      result?.steps?.find((step: any) => step.name === stepName);

    const approveStep = getStep("approve");
    const burnStep = getStep("burn");
    const attestationStep = getStep("fetchAttestation");
    const mintStep = getStep("mint");

    console.dir({
      approveStep,
      burnStep,
      attestationStep,
      mintStep,
    }, { depth: null, colors: true });

  } catch (error: any) {
    console.error("📌 Circle Bridge Execution Status:", error?.message || error);
  }
}

main().catch((err: any) => {
  console.error("❌ Error:", err.message || err);
});
