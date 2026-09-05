import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from 'viem';
import { watchAccount, reconnect } from '@wagmi/core';

// 1. Official Reown Project ID
const projectId = 'aed09fc7bcbfbe5615fa2f991b92e8b3';

// 2. Define Arc Testnet L1 Chain (ID 5042002)
const arcTestnet = defineChain({
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
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [arcTestnet],
});

// 4. Create AppKit instance with Arc L1 Branding
const modal = createAppKit({
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
    '--w3m-z-index': 99999
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
    emailShowWallets: true,
  },
});

// 5. Expose globally to window
window.reownAppKit = modal;
window.reownWagmiConfig = wagmiAdapter.wagmiConfig;

window.openReownAppKit = function() {
  try {
    modal.open();
  } catch (e) {
    console.error('Error opening Reown AppKit:', e);
  }
};

window.closeReownAppKit = function() {
  try {
    modal.close();
  } catch (e) {
    console.error('Error closing Reown AppKit:', e);
  }
};

// 6. Listen to Account changes and sync with PulseGrid app.js
if (typeof window !== 'undefined') {
  try {
    // Reconnect existing session on load
    reconnect(wagmiAdapter.wagmiConfig).catch(() => {});

    watchAccount(wagmiAdapter.wagmiConfig, {
      async onChange(account) {
        if (account && account.address) {
          console.log('Reown Wallet Connected:', account.address);
          let provider = window.ethereum || null;
          if (account.connector && typeof account.connector.getProvider === 'function') {
            try {
              const p = await account.connector.getProvider();
              if (p) provider = p;
            } catch (err) {
              console.warn('Could not get provider from connector:', err);
            }
          }
          window.activeWeb3Provider = provider;
          if (typeof window.onWalletConnected === 'function') {
            window.onWalletConnected(account.address, 'Reown AppKit');
          }
        } else {
          console.log('Reown Wallet Disconnected');
          window.activeWeb3Provider = null;
          if (typeof window.disconnectWallet === 'function' && window.currentAccount) {
            window.disconnectWallet();
          }
        }
      }
    });
  } catch (err) {
    console.warn('Reown watchAccount notice:', err);
  }
}
