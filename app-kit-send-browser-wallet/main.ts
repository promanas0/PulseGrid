import type { EIP1193Provider } from "viem";
import { createViemAdapter } from "@circle-fin/adapter-viem-v2";

type EIP6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
};

declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent<EIP6963ProviderDetail>;
  }
}

/**
 * EIP-6963 Browser Wallet Discovery Procedure
 */
async function discoverBrowserWallets(): Promise<EIP6963ProviderDetail[]> {
  const providers = new Map<string, EIP6963ProviderDetail>();

  const handleProviderAnnouncement = (
    event: WindowEventMap["eip6963:announceProvider"],
  ) => {
    providers.set(event.detail.info.uuid, event.detail);
  };

  window.addEventListener(
    "eip6963:announceProvider",
    handleProviderAnnouncement,
  );
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  await new Promise((resolve) => window.setTimeout(resolve, 250));
  window.removeEventListener(
    "eip6963:announceProvider",
    handleProviderAnnouncement,
  );

  return [...providers.values()];
}

const statusLog = document.getElementById("statusLog") as HTMLDivElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;

// Auto-discover installed Web3 browser wallets
discoverBrowserWallets().then((wallets) => {
  console.log("🔍 Discovered EIP-6963 Browser Wallets:", wallets);
  if (wallets.length > 0 && statusLog) {
    statusLog.innerText = `🔍 Discovered ${wallets.length} EIP-6963 Browser Wallet(s): ${wallets.map(w => w.info.name).join(", ")}`;
  }
});

sendBtn?.addEventListener("click", async () => {
  const recipient = (document.getElementById("recipient") as HTMLInputElement).value;
  const amount = (document.getElementById("amount") as HTMLInputElement).value;

  if (!recipient || !amount) {
    if (statusLog) statusLog.innerText = "❌ Please enter recipient and amount.";
    return;
  }

  if (statusLog) statusLog.innerText = "🚀 Connecting Browser Wallet on Arc Testnet...";

  try {
    const discoveredWallets = await discoverBrowserWallets();
    const activeProvider = discoveredWallets[0]?.provider || (window as any).ethereum;

    const viemAdapter = createViemAdapter();
    if (statusLog) statusLog.innerText = `✅ EIP-6963 Wallet & Viem Adapter initialized! Sending ${amount} USDC to ${recipient.slice(0, 8)}...`;
  } catch (error: any) {
    if (statusLog) statusLog.innerText = `❌ Error: ${error.message || error}`;
  }
});
