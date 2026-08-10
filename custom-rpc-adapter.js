import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { createPublicClient, createWalletClient, http } from "viem";
import { arcTestnet, sepolia } from "viem/chains";
import { AppKit } from "@circle-fin/app-kit";

/**
 * Circle AppKit - Custom RPC Client Factory with Viem Private Key Adapter (ES Module / CommonJS)
 * Configures dedicated RPC endpoints, retry count, and timeouts for Ethereum Sepolia & Arc Testnet
 */

const alchemyKey = process.env.ALCHEMY_KEY || "demo";

const RPC_BY_CHAIN_ID = {
  [sepolia.id]: process.env.SEPOLIA_RPC_URL || `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`,
  [arcTestnet.id]: process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network",
};

const customViemAdapter = createViemAdapterFromPrivateKey({
  privateKey: process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001",
  getPublicClient: ({ chain }) => {
    const rpcUrl = RPC_BY_CHAIN_ID[chain.id] || chain.rpcUrls.default.http[0];
    console.log(`📡 Initializing Public Client for ${chain.name} (${chain.id}) -> ${rpcUrl}`);
    return createPublicClient({
      chain,
      transport: http(rpcUrl, {
        retryCount: 3,
        timeout: 10000,
      }),
    });
  },
  getWalletClient: ({ chain, account }) => {
    const rpcUrl = RPC_BY_CHAIN_ID[chain.id] || chain.rpcUrls.default.http[0];
    console.log(`🔑 Initializing Wallet Client for ${chain.name} (${chain.id}) -> ${rpcUrl}`);
    return createWalletClient({
      account,
      chain,
      transport: http(rpcUrl, {
        retryCount: 3,
        timeout: 10000,
      }),
    });
  },
});

async function main() {
  console.log("🚀 Testing Custom RPC Factory Adapter for Arc Testnet...");
  const kit = new AppKit();

  try {
    const balanceAction = await customViemAdapter.prepareAction(
      "usdc.balanceOf",
      {},
      { chain: "Arc_Testnet" },
    );
    console.log("✅ Custom RPC Adapter initialized successfully!");
  } catch (error) {
    console.log("📌 Custom RPC Adapter Status:", error.message || error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { customViemAdapter };
