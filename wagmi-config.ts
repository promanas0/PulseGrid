import { arcTestnet, mainnet } from "viem/chains";
import { createConfig, http } from "wagmi";
import { getDefaultConfig } from "connectkit";

/**
 * ArchPulse - ConnectKit & Wagmi Config with Arc Testnet Support
 * ArchPulse Ecosystem.
 */

export const config = createConfig(
  getDefaultConfig({
    chains: [arcTestnet, mainnet],
    transports: {
      [arcTestnet.id]: http("https://rpc.testnet.arc.io"),
      [mainnet.id]: http("https://cloudflare-eth.com"),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.WALLETCONNECT_PROJECT_ID || "aed09fc7bcbfbe5615fa2f991b92e8b3",
    appName: "PulseGrid",
  }),
);

console.log("✅ Wagmi & ConnectKit Configured for Arc Testnet (ID: 5042002) & Mainnet!");
