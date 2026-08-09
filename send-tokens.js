const { initiateDeveloperControlledWalletsClient } = require("@circle-fin/developer-controlled-wallets");

/**
 * Circle Developer Controlled Wallet - Token Transfer Quickstart (JS runner)
 * For Arc Testnet (Chain ID 5042002)
 */

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: apiKey,
  entitySecret: entitySecret,
});

async function sendTokens() {
  console.log("🚀 Initiating Circle Token Transfer on Arc Testnet...");
  
  const walletId = process.env.CIRCLE_WALLET_ID || "YOUR_WALLET_ID";
  const destinationAddress = process.env.DESTINATION_ADDRESS || "0xe45f8f8b39414578b871ed196edcba9d2822a432";
  const amount = process.env.TRANSFER_AMOUNT || "1.00";

  try {
    const response = await client.createTransaction({
      walletId: walletId,
      destinationAddress: destinationAddress,
      amounts: [amount],
      fee: {
        type: "level",
        config: {
          feeLevel: "MEDIUM"
        }
      }
    });

    console.log("✅ Circle Token Transfer Submitted Successfully!");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Error sending tokens:", error?.message || error);
  }
}

sendTokens();
