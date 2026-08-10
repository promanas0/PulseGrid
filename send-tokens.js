import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer Controlled Wallet - Token Transfer Quickstart (JS runner)
 * Arc Testnet (Chain ID 5042002)
 */

const SOURCE_WALLET_ADDRESS = process.env.SOURCE_WALLET_ADDRESS || "YOUR_SOURCE_WALLET_ADDRESS";
const SOURCE_WALLET_BLOCKCHAIN = process.env.SOURCE_WALLET_BLOCKCHAIN || "ARC-TESTNET";
const DESTINATION_WALLET_ADDRESS = process.env.DESTINATION_WALLET_ADDRESS || "0xe45f8f8b39414578b871ed196edcba9d2822a432";
const DESTINATION_WALLET_ID = process.env.DESTINATION_WALLET_ID || "YOUR_DESTINATION_WALLET_ID";
const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000";
const TRANSFER_AMOUNT_USDC = process.env.TRANSFER_AMOUNT_USDC || "5";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd",
  entitySecret: process.env.CIRCLE_ENTITY_SECRET || "",
});

async function main() {
  console.log("🚀 Initiating Circle Developer-Controlled Token Transfer on Arc Testnet...");

  if (
    SOURCE_WALLET_ADDRESS === "YOUR_SOURCE_WALLET_ADDRESS" ||
    DESTINATION_WALLET_ID === "YOUR_DESTINATION_WALLET_ID" ||
    DESTINATION_WALLET_ADDRESS === "YOUR_DESTINATION_WALLET_ADDRESS"
  ) {
    console.warn("⚠️ Configure wallet parameters in .env before live transfer execution.");
  }

  const transferResponse = await client.createTransaction({
    blockchain: SOURCE_WALLET_BLOCKCHAIN,
    walletAddress: SOURCE_WALLET_ADDRESS,
    tokenAddress: ARC_TESTNET_USDC,
    destinationAddress: DESTINATION_WALLET_ADDRESS,
    amount: [TRANSFER_AMOUNT_USDC],
    fee: {
      type: "level",
      config: { feeLevel: "MEDIUM" },
    },
  });

  const transactionId = transferResponse.data?.id;
  let currentState = transferResponse.data?.state ?? "";

  if (!transactionId) {
    throw new Error("Transaction creation failed: no ID returned");
  }

  console.log("✅ Transfer response:", JSON.stringify(transferResponse.data, null, 2));

  const terminalStates = new Set(["COMPLETE", "FAILED", "CANCELLED", "DENIED"]);

  console.log("⏳ Waiting for transaction completion on Arc Testnet...");
  while (!terminalStates.has(currentState)) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const pollResponse = await client.getTransaction({ id: transactionId });
    const tx = pollResponse.data?.transaction;
    currentState = tx?.state ?? "";
    console.log(`📌 Transaction State: ${currentState}`, pollResponse.data);

    if (currentState === "COMPLETE") break;
  }

  if (currentState !== "COMPLETE") {
    throw new Error(`Transaction ended in state: ${currentState}`);
  }

  console.log("🎉 Transfer Completed Successfully!");

  if (DESTINATION_WALLET_ID && !DESTINATION_WALLET_ID.includes("YOUR_")) {
    const destinationBalanceResponse = await client.getWalletTokenBalance({
      id: DESTINATION_WALLET_ID,
    });
    console.log("💰 Recipient wallet balance:", JSON.stringify(destinationBalanceResponse.data, null, 2));
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
