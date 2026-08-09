const { arcTestnet, mainnet } = require("viem/chains");
const { createConfig, http } = require("wagmi");
const { getDefaultConfig } = require("connectkit");

/**
 * ArcPulse - ConnectKit & Wagmi Config with Arc Testnet Support (JS runner)
 */

const config = createConfig(
  getDefaultConfig({
    chains: [arcTestnet, mainnet],
    transports: {
      [arcTestnet.id]: http("https://rpc.testnet.arc.io"),
      [mainnet.id]: http("https://cloudflare-eth.com"),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.WALLETCONNECT_PROJECT_ID || "demo-project-id",
    appName: "ArcPulse DEX",
  }),
);

console.log("✅ Wagmi & ConnectKit Configured for Arc Testnet (ID: 5042002) & Mainnet!");

module.exports = { config };
