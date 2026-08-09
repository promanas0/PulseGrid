import { AppKit } from "@circle-fin/app-kit";

/**
 * Circle AppKit - Multi-Kit Chain Query & Filtering Suite (JS runner)
 */

const kit = new AppKit();

function main() {
  console.log("🌐 Inspecting Circle AppKit Multi-Kit Chain Query Filters...");

  try {
    // 1. Bridge Kit EVM Mainnet Forwarder Chains
    const bridgeChains = kit.getSupportedChains("bridge");

    // 2. Swap Kit Mainnet Chains
    const swapChains = kit.getSupportedChains("swap");

    // 3. Unified Balance Kit Destination Forwarder Chains
    const unifiedBalanceChains = kit.getSupportedChains("unifiedBalance");

    console.dir({
      bridgeChainsCount: bridgeChains ? bridgeChains.length : 0,
      bridgeChains,
      swapChainsCount: swapChains ? swapChains.length : 0,
      swapChains,
      unifiedBalanceChainsCount: unifiedBalanceChains ? unifiedBalanceChains.length : 0,
      unifiedBalanceChains,
    }, { depth: null, colors: true });
  } catch (err) {
    console.warn("📌 Circle AppKit Multi-Kit Chain Filters Status:", err.message || err);
  }
}

main();
