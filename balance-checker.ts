import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";
import { formatUnits } from "viem";

/**
 * Circle Adapter Action - USDC Balance Inspector on Arc Testnet
 * Uses adapter.prepareAction("usdc.balanceOf") and viem formatUnits
 * Built for ArcPulse Ecosystem by ProManas
 */

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";

const sourceAdapter = createCircleWalletsAdapter({
  apiKey,
  entitySecret,
});

async function main() {
  console.log("🔍 Checking USDC Balance on Arc Testnet via Adapter Action...");

  try {
    const balanceAction = await sourceAdapter.prepareAction(
      "usdc.balanceOf",
      {},
      { chain: "Arc_Testnet" },
    );

    const balance: any = await balanceAction.execute();
    const formatted = formatUnits(BigInt(balance || 0), 6);

    console.log("📌 Raw Balance (atomic units):", balance?.toString());
    console.log(`💵 Formatted USDC Balance on Arc Testnet: ${formatted} USDC`);

  } catch (error: any) {
    console.error("❌ Error fetching balance:", error?.message || error);
  }
}

main().catch((err: any) => {
  console.error("❌ Unhandled Error:", err?.message || err);
});
