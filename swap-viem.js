import 'dotenv/config';
import { AppKit } from "@circle-fin/app-kit";
import { ArcTestnet } from "@circle-fin/app-kit/chains";
import { createViemAdapterFromPrivateKey, createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";

/**
 * Circle AppKit Swap using Viem V2 Adapter with official ArcTestnet from @circle-fin/app-kit/chains (JS runner)
 * USDC -> EURC on Arc Testnet (Chain ID 5042002)
 * Supports Browser Provider (window.ethereum) & Private Key Adapters
 */

const kit = new AppKit();

async function main() {
  console.log("🚀 Initiating Circle AppKit Swap with Viem Adapter on Arc Testnet...");
  console.log(`📌 Chain: ${ArcTestnet.name || 'Arc Testnet'} (ID: ${ArcTestnet.id || 5042002})`);
  console.log("📌 Route: 1.00 USDC -> EURC");

  let viemAdapter;

  if (typeof window !== "undefined" && window.ethereum) {
    // Browser Wallet (MetaMask / WalletConnect Provider)
    console.log("🌐 Connected via Browser Wallet Provider (window.ethereum)...");
    viemAdapter = await createViemAdapterFromProvider({
      provider: window.ethereum,
    });
  } else if (process.env.PRIVATE_KEY) {
    const rawPk = process.env.PRIVATE_KEY.trim();
    const formattedPk = rawPk.startsWith("0x") ? rawPk : `0x${rawPk}`;
    viemAdapter = createViemAdapterFromPrivateKey({
      privateKey: formattedPk,
    });
  } else {
    throw new Error("No Web3 Provider or PRIVATE_KEY found in .env");
  }

  try {
    const result = await kit.swap({
      from: { adapter: viemAdapter, chain: ArcTestnet },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
    });

    console.log("🎉 Swap Executed Successfully!", JSON.stringify(result, null, 2));
  } catch (error) {
    console.log("📌 Circle AppKit Viem Swap Status:", error.message || error);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
