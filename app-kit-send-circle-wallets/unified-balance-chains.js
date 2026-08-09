import { AppKit } from "@circle-fin/app-kit";

/**
 * Circle AppKit Unified Balance Supported Chains Inspector (JS runner)
 */

const kit = new AppKit();

function main() {
  console.log("🌐 Inspecting Circle AppKit Unified Balance Supported Chains...");

  try {
    const destinationChains = kit.getSupportedChains("unifiedBalance");

    console.dir({
      query: { forwarderSupported: "destination" },
      supportedChainsCount: destinationChains ? destinationChains.length : 0,
      supportedChains: destinationChains,
    }, { depth: null, colors: true });
  } catch (err) {
    console.warn("📌 Circle AppKit Unified Balance Status:", err.message || err);
  }
}

main();
