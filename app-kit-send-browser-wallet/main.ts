import { createViemAdapter } from "@circle-fin/adapter-viem-v2";

/**
 * Circle AppKit - Browser Wallet Send (Arc Testnet)
 * Powered by ArcPulse Ecosystem by ProManas
 */

const statusLog = document.getElementById("statusLog") as HTMLDivElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;

sendBtn?.addEventListener("click", async () => {
  const recipient = (document.getElementById("recipient") as HTMLInputElement).value;
  const amount = (document.getElementById("amount") as HTMLInputElement).value;

  if (!recipient || !amount) {
    if (statusLog) statusLog.innerText = "❌ Please enter recipient and amount.";
    return;
  }

  if (statusLog) statusLog.innerText = "🚀 Connecting Browser Wallet on Arc Testnet...";

  try {
    const viemAdapter = createViemAdapter();
    if (statusLog) statusLog.innerText = `✅ Viem Adapter initialized! Sending ${amount} USDC to ${recipient.slice(0, 8)}...`;
  } catch (error: any) {
    if (statusLog) statusLog.innerText = `❌ Error: ${error.message || error}`;
  }
});
