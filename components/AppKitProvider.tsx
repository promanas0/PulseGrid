'use client';

import React, { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from 'viem';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Reown Project ID
export const projectId = 'aed09fc7bcbfbe5615fa2f991b92e8b3';

// 2. Define Arc Testnet L1 Chain
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
    public: {
      http: [
        'https://rpc.testnet.arc.network',
        'https://rpc.testnet.arc.io',
        'https://rpc.drpc.testnet.arc.io'
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

// 3. Set up Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [arcTestnet],
});

// 4. Create AppKit instance with Arc L1 Branding
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [arcTestnet],
  defaultNetwork: arcTestnet,
  metadata: {
    name: 'PulseGrid',
    description: 'Arc L1 Web3 Ecosystem & DEX Engine',
    url: 'https://pulsegrid-hub.vercel.app',
    icons: ['https://pulsegrid-hub.vercel.app/logo.png'],
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#7E22CE',
    '--w3m-border-radius-master': '16px',
  },
  features: {
    analytics: false,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple'],
    emailShowWallets: true,
  },
});

const queryClient = new QueryClient();

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
