import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";
import { formatUnits } from "viem";

/**
 * Circle Adapter Action - USDC Balance Inspector on Arc Testnet
 * Uses adapter.prepareAction("usdc.balanceOf") and viem formatUnits
 * ArchPulse Ecosystem.
 */

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd";
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
