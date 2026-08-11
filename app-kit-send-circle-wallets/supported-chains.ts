import { AppKit } from "@circle-fin/app-kit";

/**
 * Circle AppKit Supported Chains Inspector
 * ArcPulse Ecosystem.
 */

const kit = new AppKit();

function main() {
  console.log("🌐 Inspecting Circle AppKit Supported Chains...");

  const allChains = kit.getSupportedChains();
  const bridgeChains = kit.getSupportedChains("bridge");
  const swapChains = kit.getSupportedChains("swap");
  const unifiedBalanceChains = kit.getSupportedChains("unifiedBalance");

  console.dir({
    allChainsCount: allChains?.length || 0,
    allChains,
    bridgeChains,
    swapChains,
    unifiedBalanceChains,
  }, { depth: null, colors: true });
}

main();
