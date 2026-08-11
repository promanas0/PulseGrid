import { publicEncrypt, constants, randomBytes } from "node:crypto";

/**
 * Circle Developer Controlled Wallets — RSA-OAEP Entity Secret Encryptor (TypeScript)
 * Encrypts 32-byte hex entity secret with Circle Public Key PEM
 * Built for ArcPulse Ecosystem by ProManas
 */

export interface EncryptionResult {
  entitySecret: string;
  ciphertextBase64: string | null;
}

export function encryptEntitySecretWithPublicKey(
  publicKeyPem: string,
  customEntitySecret?: string
): EncryptionResult {
  const entitySecret = customEntitySecret || randomBytes(32).toString("hex");
  console.log("🔑 Entity Secret (32-byte hex):", entitySecret);

  if (!publicKeyPem || !publicKeyPem.includes("BEGIN PUBLIC KEY")) {
    console.warn("⚠️ Warning: Valid Circle Public Key PEM required for RSA-OAEP encryption.");
    return { entitySecret, ciphertextBase64: null };
  }

  try {
    const encrypted = publicEncrypt(
      {
        key: publicKeyPem,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(entitySecret, "hex")
    );

    const ciphertextBase64 = encrypted.toString("base64");
    console.log("🔒 Encrypted Base64 Ciphertext:", ciphertextBase64);

    return { entitySecret, ciphertextBase64 };
  } catch (err: any) {
    console.error("❌ Encryption Error:", err?.message || err);
    return { entitySecret, ciphertextBase64: null };
  }
}

// Quick Test Execution
if (typeof require !== "undefined" && require.main === module) {
  const currentEntitySecret = process.env.CIRCLE_ENTITY_SECRET || "204c43bfde66206f2e510a398f5725e6e5c7f215ae4ffab072d3da455b2980a5";
  console.log("🚀 Executing Circle Entity Secret RSA-OAEP Encryption...");
  encryptEntitySecretWithPublicKey("", currentEntitySecret);
}
