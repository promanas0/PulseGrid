import { createCircleAdapter } from '@circle-fin/adapter-circle-wallets';
import { createAppKit } from '@circle-fin/app-kit';

console.log("🚀 Initializing Circle App Kit & Swap SDK...");

async function main() {
  try {
    const apiKey = process.env.CIRCLE_API_KEY || '';
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET || '';

    const circleAdapter = createCircleAdapter({
      apiKey: apiKey,
    });

    const appKit = createAppKit({
      adapters: [circleAdapter],
    });

    console.log("✅ Circle App Kit & Adapter initialized successfully!");
    console.log(`API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'Not configured'}`);
    console.log(`Entity Secret: ${entitySecret ? 'Configured ✓' : 'Not configured'}`);
    console.log("Ready to execute same-chain and cross-chain swaps on Arc Testnet.");
  } catch (error) {
    console.error("❌ Error initializing Circle Swap SDK:", error);
  }
}

main();
