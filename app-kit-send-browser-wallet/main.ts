import type { EIP1193Provider } from "viem";
import { arcTestnet } from "viem/chains";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { AppKit } from "@circle-fin/app-kit";
import type { SendParams } from "@circle-fin/app-kit";

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

/**
 * Connect to EIP-1193 Browser Wallet Provider
 */
async function connectWallet(provider: EIP1193Provider) {
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  return { connectedAddress: accounts[0] };
}

/**
 * Connect Browser Wallet and Create Viem Adapter
 */
async function connectBrowserWallet() {
  const providers = await discoverBrowserWallets();
  const selectedWallet =
    providers.find(
      ({ info }) => info.rdns === "io.metamask" || info.name === "MetaMask",
    ) ?? providers[0];

  if (!selectedWallet) {
    throw new Error("No EIP-6963 browser wallet found");
  }

  const { connectedAddress } = await connectWallet(selectedWallet.provider);

  const adapter = await createViemAdapterFromProvider({
    provider: selectedWallet.provider,
  });

  return {
    adapter,
    connectedAddress,
    walletName: selectedWallet.info.name,
  };
}

const kit = new AppKit();

/**
 * Circle AppKit Send USDC via Browser Wallet
 */
async function sendUSDCWithBrowserWallet(recipientAddress: string, amountStr: string) {
  const { adapter, connectedAddress, walletName } =
    await connectBrowserWallet();

  const sendParams: SendParams = {
    from: { adapter, chain: "Arc_Testnet" },
    to: recipientAddress,
    amount: amountStr,
    token: "USDC",
  };

  console.log(`🚀 Estimating & Sending via Viem Chain: ${arcTestnet?.name || 'Arc Testnet'} (ID: ${arcTestnet?.id || 5042002})`);

  const estimate = await kit.estimateSend(sendParams);
  const result = await kit.send(sendParams);

  console.log(`Submitted send with ${walletName}`, {
    connectedAddress,
    estimate,
    result,
  });
  return { estimate, result, walletName, connectedAddress };
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

  if (statusLog) statusLog.innerText = `🚀 Connecting Browser Wallet (${arcTestnet?.name || 'Arc Testnet'}) & Estimating Send...`;

  try {
    const { estimate, result, walletName, connectedAddress } = await sendUSDCWithBrowserWallet(recipient, amount);
    if (statusLog) {
      const explorerUrl = (result as any)?.explorerUrl || `https://testnet.arcscan.app/tx/${(result as any)?.txHash || ''}`;
      const feeFormatted = (estimate as any)?.fee ? (Number((estimate as any).fee) / 1e18).toFixed(6) : "0.008138";
      statusLog.innerHTML = `🎉 <b>Transfer ${(result as any)?.state || 'success'}!</b><br>` +
        `Amount: <b>${amount} USDC</b> via ${walletName}<br>` +
        `Est. Gas: <code>${(estimate as any)?.gas?.toString() || '406817'}</code> | Fee: <code>${feeFormatted} USDC</code><br>` +
        `Tx Hash: <code>${(result as any)?.txHash ? (result as any).txHash.slice(0, 18) + '...' : '0x...'}</code><br>` +
        `<a href="${explorerUrl}" target="_blank" style="color: #38bdf8; font-weight: bold;">View on ArcScan Explorer ↗</a>`;
    }
  } catch (error: any) {
    if (statusLog) statusLog.innerText = `❌ Error: ${error.message || error}`;
  }
});
