import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { registerEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer-Controlled Wallets — Entity Secret Registration & Recovery Generator
 * Generates a 32-byte hex entity secret, registers ciphertext with Circle API,
 * downloads recovery file, and saves CIRCLE_ENTITY_SECRET to .env
 * ArchPulse Ecosystem.
 */

async function main() {
  const apiKey: string | undefined = process.env.CIRCLE_API_KEY;
  if (!apiKey || apiKey.includes("TEST_API_KEY")) {
    console.warn("⚠️ Warning: Standard or placeholder CIRCLE_API_KEY detected.");
  }

  // Refuse to overwrite an existing active entity secret in .env
  const existingEnv: string = existsSync(".env")
    ? readFileSync(".env", "utf8")
    : "";

  if (/^CIRCLE_ENTITY_SECRET=[a-f0-9]{64}$/m.test(existingEnv)) {
    console.log("ℹ️ Active 32-byte CIRCLE_ENTITY_SECRET already exists in .env. Skipping registration.");
    return;
  }

  // Generate 32-byte random hex string (64 characters)
  const entitySecret: string = randomBytes(32).toString("hex");
  const recoveryFilePath: string = "./recovery";

  mkdirSync(recoveryFilePath, { recursive: true });

  console.log("🚀 Registering Entity Secret Ciphertext with Circle API...");

  try {
    await registerEntitySecretCiphertext({
      apiKey: apiKey || "TEST_API_KEY",
      entitySecret,
      recoveryFileDownloadPath: recoveryFilePath,
    });

    // Append to .env
    appendFileSync(".env", `\nCIRCLE_ENTITY_SECRET=${entitySecret}\n`);

    console.log("✅ Entity secret registered successfully!");
    console.log(`📁 Recovery file saved to: ${recoveryFilePath}`);
    console.log("🔑 CIRCLE_ENTITY_SECRET added to .env");
  } catch (error: any) {
    console.error("📌 Registration Status:", error?.message || error);
  }
}

main().catch((err: any) => {
  console.error("❌ Error registering entity secret:", err?.message || err);
});
