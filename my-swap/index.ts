import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";

console.log("🚀 Executing Circle App Kit Swap with Viem Adapter (USDC → EURC on Arc Testnet)...");

async function runSwap() {
  try {
    const rawSecret = (process.env.PRIVATE_KEY || process.env.MNEMONIC || "").trim();

    let account;
    let privateKeyHex: `0x${string}` | undefined;

    if (rawSecret.includes(" ")) {
      // 12-word Mnemonic Seed Phrase
      account = mnemonicToAccount(rawSecret.replace(/^0x/, ""));
      const hdKey = account.getHdKey();
      if (hdKey && hdKey.privateKey) {
        privateKeyHex = `0x${Buffer.from(hdKey.privateKey).toString("hex")}` as `0x${string}`;
      }
      console.log(`🔑 Derived Wallet Address from Mnemonic: ${account.address}`);
    } else {
      // 64-char Hex Private Key
      const cleanHex = rawSecret.replace(/^0x/, "");
      if (cleanHex.length >= 64) {
        privateKeyHex = `0x${cleanHex}` as `0x${string}`;
        account = privateKeyToAccount(privateKeyHex);
        console.log(`🔑 Wallet Address from Hex Private Key: ${account.address}`);
      }
    }

    if (!account || !privateKeyHex) {
      console.log("\n========================================================");
      console.log("⚠️ NO VALID MNEMONIC OR PRIVATE KEY FOUND IN my-swap/.env");
      console.log("========================================================");
      console.log("Please open my-swap/.env and set:");
      console.log('PRIVATE_KEY=0xfe30acf615c85206faf13da075c44dde51804e01f5a64ede11220892142a8900');
      console.log("========================================================\n");
      return;
    }

    // Dynamic Swap Amount from CLI argument (e.g., npm start 5.0) or default 1.00
    const swapAmount = process.argv[2] || process.env.SWAP_AMOUNT || "1.00";

    // Initialize Viem Adapter directly with valid Private Key
    const adapter = createViemAdapterFromPrivateKey({
      privateKey: privateKeyHex,
    });

    const kit = new AppKit();

    console.log(`🔄 Executing Circle App Kit On-Chain Swap (${swapAmount} USDC → EURC)...`);

    const result = await kit.swap({
      from: {
        adapter,
        chain: "Arc_Testnet",
      },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: swapAmount,
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
