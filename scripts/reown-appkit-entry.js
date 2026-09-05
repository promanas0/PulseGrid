import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';
import { watchAccount, reconnect } from '@wagmi/core';

// 1. Official Reown Project ID (Configured by User)
const projectId = 'aed09fc7bcbfbe5615fa2f991b92e8b3';

// 2. Define Arc Testnet L1 Chain (ID 5042002) via Reown Networks
const arcTestnet = defineChain({
  id: 5042002,
  caipNetworkId: 'eip155:5042002',
  chainNamespace: 'eip155',
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
let modal = null;
try {
  modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [arcTestnet],
    defaultNetwork: arcTestnet,
    metadata: {
      name: 'PulseGrid',
      description: 'Arc L1 Web3 Ecosystem & DEX Engine',
      url: window.location?.origin || 'https://pulsegrid-hub.vercel.app',
      icons: ['https://pulsegrid-hub.vercel.app/logo.png'],
    },
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#7E22CE',
      '--w3m-border-radius-master': '16px',
      '--w3m-z-index': 999999
    },
    features: {
      analytics: false,
      email: false,
      socials: false,
      emailShowWallets: true,
    },
  });
  console.log('[PulseGrid] Official Reown AppKit initialized successfully!');
} catch (initErr) {
  console.error('[PulseGrid] Error initializing Reown AppKit:', initErr);
}

// 5. Expose globally to window
window.reownAppKit = modal;
window.reownWagmiConfig = wagmiAdapter.wagmiConfig;

window.openReownAppKit = async function() {
  try {
    if (modal && typeof modal.open === 'function') {
      console.log('[PulseGrid] Opening Reown AppKit modal...');
      await modal.open();
      return true;
    }
  } catch (e) {
    console.error('[PulseGrid] Error opening Reown AppKit:', e);
  }
  // Fallback if modal fails to open
  const fallback = document.getElementById('walletConnectModal');
  if (fallback) {
    fallback.classList.remove('hidden');
    fallback.style.display = 'flex';
  }
  return false;
};

window.closeReownAppKit = function() {
  try {
    if (modal && typeof modal.close === 'function') {
      modal.close();
    }
  } catch (e) {
    console.error('[PulseGrid] Error closing Reown AppKit:', e);
  }
};

// 6. Listen to Account changes and sync with PulseGrid app.js
if (typeof window !== 'undefined') {
  try {
    reconnect(wagmiAdapter.wagmiConfig).catch(() => {});

    watchAccount(wagmiAdapter.wagmiConfig, {
      async onChange(account) {
        if (account && account.address) {
          console.log('[PulseGrid] Reown Wallet Connected:', account.address);
          let provider = window.ethereum || null;
          if (account.connector && typeof account.connector.getProvider === 'function') {
            try {
              const p = await account.connector.getProvider();
              if (p) provider = p;
            } catch (err) {
              console.warn('[PulseGrid] Could not get provider from connector:', err);
            }
          }
          window.activeWeb3Provider = provider;
          if (typeof window.onWalletConnected === 'function') {
            window.onWalletConnected(account.address, 'Reown AppKit');
          }
        } else {
          console.log('[PulseGrid] Reown Wallet Disconnected');
          window.activeWeb3Provider = null;
          if (typeof window.disconnectWallet === 'function' && window.currentAccount) {
            window.disconnectWallet();
          }
        }
      }
    });
  } catch (err) {
    console.warn('[PulseGrid] Reown watchAccount notice:', err);
  }
}
