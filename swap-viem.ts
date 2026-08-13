import 'dotenv/config';
import { AppKit } from "@circle-fin/app-kit";
import { ArcTestnet } from "@circle-fin/app-kit/chains";
import { createViemAdapterFromPrivateKey, createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";

/**
 * Circle AppKit Swap using Viem V2 Adapter with official viem/chains arcTestnet
 * USDC -> EURC on Arc Testnet (Chain ID 5042002)
 * Supports Browser Provider (window.ethereum) & Private Key Adapters
 * Built for ArcPulse Ecosystem by ProManas
 */

interface EIP6963ProviderDetail {
  info: {
    rdns: string;
    name: string;
    icon: string;
    uuid: string;
  };
  provider: any;
}

export function discoverBrowserWallets(): Promise<EIP6963ProviderDetail[]> {
  return new Promise((resolve) => {
    const providers: EIP6963ProviderDetail[] = [];
    if (typeof window === "undefined") {
      resolve(providers);
      return;
    }

    function onAnnounceProvider(event: any) {
      if (event.detail && !providers.some(p => p.info.uuid === event.detail.info.uuid)) {
        providers.push(event.detail);
      }
    }

    window.addEventListener("eip6963:announceProvider", onAnnounceProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounceProvider);
      if (providers.length === 0 && (window as any).ethereum) {
        providers.push({
          info: {
            rdns: "io.metamask",
            name: "MetaMask",
            icon: "",
            uuid: "default-ethereum",
          },
          provider: (window as any).ethereum,
        });
      }
      resolve(providers);
    }, 200);
  });
}

export async function getInjectedWalletProvider(rdns: string = "io.metamask"): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Window is undefined. Cannot get browser wallet provider.");
  }

  const providers = await discoverBrowserWallets();
  const selectedWallet = providers.find((p) => p.info.rdns === rdns) ?? providers[0];
  if (!selectedWallet?.provider) {
    throw new Error(`Injected wallet provider not found for ${rdns}`);
  }
  return selectedWallet.provider;
}

export async function executeSwapWithInjectedWallet(
  rdns: string = "io.metamask",
  amountIn: string = "1",
  tokenIn: string = "EURC",
  tokenOut: string = "USDC"
) {
  const provider = await getInjectedWalletProvider(rdns);
  await provider.request({ method: "eth_requestAccounts", params: undefined });

  const viemAdapter = await createViemAdapterFromProvider({ provider });

  const kit = new AppKit();
  const result = await kit.swap({
    from: { adapter: viemAdapter, chain: ArcTestnet },
    tokenIn,
    tokenOut,
    amountIn,
    config: {
      ...(process.env.KIT_KEY ? { kitKey: process.env.KIT_KEY } : {}),
      slippageBps: 300,
      allowanceStrategy: "approve",
    }
  } as any);

  return result;
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
    // Private Key execution for Node.js / CLI
    const rawPk = process.env.PRIVATE_KEY.trim();
    const formattedPk = (rawPk.startsWith("0x") ? rawPk : `0x${rawPk}`) as `0x${string}`;
    viemAdapter = createViemAdapterFromPrivateKey({
      privateKey: formattedPk,
    });
  }

  if (!viemAdapter) {
    throw new Error("No EIP-6963 Web3 Provider or PRIVATE_KEY found in .env");
  }

  try {
    // Step 1: Swap execute karo
    const result: any = await kit.swap({
      from: { adapter: viemAdapter, chain: ArcTestnet },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
      config: { slippageBps: 300 } // 3% slippage
    });

    console.log("TX Hash:", result?.txHash || result?.hash);

    // Step 2: Swap COMPLETE hone ka wait karo (if KIT_KEY present)
    if (result && process.env.KIT_KEY) {
      console.log("⏳ Waiting for Swap to COMPLETE...");
      const status: any = await kit.waitForSwap({
        result,
        kitKey: process.env.KIT_KEY,
      } as any);
      console.log("Final status:", status?.progress?.status || status?.status || "COMPLETED");
    }

    console.log("🎉 Swap Executed Successfully!", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.log("📌 Circle AppKit Viem Swap Status:", error?.message || error);
  }
}

main().catch((err: any) => {
  console.error("❌ Error:", err.message || err);
});
