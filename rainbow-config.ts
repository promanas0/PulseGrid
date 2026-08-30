import { defineChain } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

/**
 * Circle Arc L1 Testnet Chain Configuration
 * Chain ID: 5042002 (0x4CEF52)
 * Native Gas: USDC (18 decimals)
 * Explorer: https://testnet.arcscan.app
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.testnet.arc.network',
        'https://rpc.testnet.arc.io',
        'https://rpc.drpc.testnet.arc.io'
      ],
    },
    public: {
      http: [
        'https://rpc.testnet.arc.network',
        'https://rpc.testnet.arc.io'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
});

export const rainbowConfig = getDefaultConfig({
  appName: 'PulseGrid — Arc L1 Web3 Ecosystem',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'aed09fc7bcbfbe5615fa2f991b92e8b3',
  chains: [arcTestnet, mainnet, sepolia],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
    [mainnet.id]: http('https://cloudflare-eth.com'),
    [sepolia.id]: http('https://rpc.sepolia.org'),
  },
  ssr: true,
});
