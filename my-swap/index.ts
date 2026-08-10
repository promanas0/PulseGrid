import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";

console.log("🚀 Executing Circle App Kit Swap with Viem Adapter (USDC → EURC on Arc Testnet)...");

async function runSwap() {
  try {
    const mnemonic = process.env.MNEMONIC;
    const privateKey = process.env.PRIVATE_KEY;

    let account;
    if (mnemonic && mnemonic.trim() && !mnemonic.includes("YOUR_")) {
      account = mnemonicToAccount(mnemonic.trim());
      console.log(`🔑 Derived Account Address from Mnemonic: ${account.address}`);
    } else if (privateKey && privateKey.trim() && !privateKey.includes("YOUR_")) {
      const formattedPk = (privateKey.trim().startsWith("0x") ? privateKey.trim() : `0x${privateKey.trim()}`) as `0x${string}`;
      account = privateKeyToAccount(formattedPk);
      console.log(`🔑 Account Address from Private Key: ${account.address}`);
    } else {
      console.log("\n========================================================");
      console.log("⚠️ NO MNEMONIC OR PRIVATE KEY FOUND IN my-swap/.env");
      console.log("========================================================");
      console.log("Please open my-swap/.env and set:");
      console.log('MNEMONIC="soda canoe forest spy anchor fame victory chronic tissue express discover anxiety"');
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
