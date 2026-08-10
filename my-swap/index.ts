import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";

console.log("🚀 Executing Circle App Kit Swap with Viem Adapter (USDC → EURC on Arc Testnet)...");

async function runSwap() {
  try {
    const rawSecret = (process.env.PRIVATE_KEY || process.env.MNEMONIC || "").replace(/^0x/, "").trim();

    let account;
    if (rawSecret && rawSecret.includes(" ")) {
      // 12-word Mnemonic Seed Phrase
      account = mnemonicToAccount(rawSecret);
      console.log(`🔑 Derived Wallet Address from Mnemonic: ${account.address}`);
    } else if (rawSecret && rawSecret.length >= 64) {
      // 64-char Hex Private Key
      const formattedPk = rawSecret.startsWith("0x") ? (rawSecret as `0x${string}`) : (`0x${rawSecret}` as `0x${string}`);
      account = privateKeyToAccount(formattedPk);
      console.log(`🔑 Wallet Address from Hex Private Key: ${account.address}`);
    } else {
      console.log("\n========================================================");
      console.log("⚠️ NO VALID MNEMONIC OR PRIVATE KEY FOUND IN my-swap/.env");
      console.log("========================================================");
      console.log("Please open my-swap/.env and set:");
      console.log('PRIVATE_KEY="soda canoe forest spy anchor fame victory chronic tissue express discover anxiety"');
      console.log("========================================================\n");
      return;
    }

    const walletAddress = process.env.USER_WALLET_ADDRESS || account.address;

    // Initialize Viem Adapter directly from Private Key
    const adapter = createViemAdapterFromPrivateKey({
      privateKey: account.privateKey,
    });

    const kit = new AppKit();

    console.log(`🔄 Executing Circle App Kit Viem On-Chain Swap for Address: ${walletAddress}...`);

    const result = await kit.swap({
      from: {
        adapter,
        chain: "Arc_Testnet",
        address: walletAddress,
      },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.00",
      config: {
        allowanceStrategy: "approve",
      },
    });

    console.log("========================================================");
    console.log("✅ VIEM ADAPTER SWAP EXECUTED SUCCESSFULLY!");
    console.log("========================================================");
    console.log(result);
    console.log("========================================================\n");

  } catch (error) {
    console.error("❌ Viem Swap Execution Error:", error);
  }
}

runSwap();
