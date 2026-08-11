import 'dotenv/config';
import { AppKit } from "@circle-fin/app-kit";
import { ArcTestnet } from "@circle-fin/app-kit/chains";
import { createViemAdapterFromPrivateKey, createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";

/**
 * Circle AppKit Swap using Viem V2 Adapter with official ArcTestnet from @circle-fin/app-kit/chains (JS runner)
 * USDC -> EURC on Arc Testnet (Chain ID 5042002)
 * Supports Browser Provider (window.ethereum) & Private Key Adapters
 */

export function discoverBrowserWallets() {
  return new Promise((resolve) => {
    const providers = [];
    if (typeof window === "undefined") {
      resolve(providers);
      return;
    }

    function onAnnounceProvider(event) {
      if (event.detail && !providers.some(p => p.info.uuid === event.detail.info.uuid)) {
        providers.push(event.detail);
      }
    }

    window.addEventListener("eip6963:announceProvider", onAnnounceProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounceProvider);
      if (providers.length === 0 && window.ethereum) {
        providers.push({
          info: {
            rdns: "io.metamask",
            name: "MetaMask",
            icon: "",
            uuid: "default-ethereum",
          },
          provider: window.ethereum,
        });
      }
      resolve(providers);
    }, 200);
  });
}

const kit = new AppKit();

async function main() {
  console.log("🚀 Initiating Circle AppKit Swap with Viem Adapter on Arc Testnet...");
  console.log(`📌 Chain: ${ArcTestnet.name || 'Arc Testnet'} (Chain ID: ${ArcTestnet.chainId || 5042002})`);
  console.log("📌 Route: 1.00 USDC -> EURC");

  let viemAdapter;

  if (typeof window !== "undefined") {
    // EIP-6963 Browser Wallet Discovery
    const providers = await discoverBrowserWallets();
    if (providers.length > 0) {
      const selectedWallet = providers.find((p) => p.info.rdns === "io.metamask") ?? providers[0];
      console.log(`🌐 Connected via EIP-6963 Browser Wallet: ${selectedWallet.info.name} (${selectedWallet.info.rdns})`);
      viemAdapter = await createViemAdapterFromProvider({
        provider: selectedWallet.provider,
      });
    }
  }

  if (!viemAdapter && process.env.PRIVATE_KEY) {
    const rawPk = process.env.PRIVATE_KEY.trim();
    const formattedPk = rawPk.startsWith("0x") ? rawPk : `0x${rawPk}`;
    viemAdapter = createViemAdapterFromPrivateKey({
      privateKey: formattedPk,
    });
  }

  if (!viemAdapter) {
    throw new Error("No EIP-6963 Web3 Provider or PRIVATE_KEY found in .env");
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
