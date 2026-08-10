import { createCircleAdapter } from '@circle-fin/adapter-circle-wallets';
import { createAppKit } from '@circle-fin/app-kit';

console.log("🚀 Initializing Circle App Kit & Swap SDK...");

async function main() {
  try {
    const circleAdapter = createCircleAdapter({
      apiKey: process.env.CIRCLE_API_KEY || '',
    });

    const appKit = createAppKit({
      adapters: [circleAdapter],
    });

    console.log("✅ Circle App Kit & Adapter initialized successfully!");
    console.log("Ready to execute same-chain and cross-chain swaps on Arc Testnet.");
  } catch (error) {
    console.error("❌ Error initializing Circle Swap SDK:", error);
  }
}

main();
