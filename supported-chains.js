import { AppKit } from "@circle-fin/app-kit";

/**
 * Circle AppKit Supported Chains Inspector (ES Module)
 */

const kit = new AppKit();

function main() {
  console.log("🌐 Inspecting Circle AppKit Supported Chains...");

  try {
    const allChains = kit.getSupportedChains();
    const bridgeChains = kit.getSupportedChains("bridge");
    const swapChains = kit.getSupportedChains("swap");
    const unifiedBalanceChains = kit.getSupportedChains("unifiedBalance");

    console.dir({
      allChainsCount: allChains ? allChains.length : 0,
      allChains,
      bridgeChains,
      swapChains,
      unifiedBalanceChains,
    }, { depth: null, colors: true });
  } catch (err) {
    console.warn("📌 Circle AppKit getSupportedChains Status:", err.message || err);
  }
}

main();
