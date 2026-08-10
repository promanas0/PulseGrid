import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { registerEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer-Controlled Wallets — Entity Secret Registration & Recovery Generator (ES Module)
 */

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;

  const existingEnv = existsSync(".env")
    ? readFileSync(".env", "utf8")
    : "";

  if (/^CIRCLE_ENTITY_SECRET=[a-f0-9]{64}$/m.test(existingEnv)) {
    console.log("ℹ️ Active 32-byte CIRCLE_ENTITY_SECRET already exists in .env. Skipping registration.");
    return;
  }

  const entitySecret = randomBytes(32).toString("hex");
  const recoveryFilePath = "./recovery";

  mkdirSync(recoveryFilePath, { recursive: true });

  console.log("🚀 Registering Entity Secret Ciphertext with Circle API...");

  try {
    await registerEntitySecretCiphertext({
      apiKey: apiKey || "TEST_API_KEY",
      entitySecret,
      recoveryFileDownloadPath: recoveryFilePath,
    });

    appendFileSync(".env", `\nCIRCLE_ENTITY_SECRET=${entitySecret}\n`);

    console.log("✅ Entity secret registered successfully!");
    console.log(`📁 Recovery file saved to: ${recoveryFilePath}`);
    console.log("🔑 CIRCLE_ENTITY_SECRET added to .env");
  } catch (error) {
    console.error("📌 Registration Status:", error.message || error);
  }
}

main().catch((err) => {
  console.error("❌ Error registering entity secret:", err.message || err);
});
