const crypto = require('crypto');
const fs = require('fs');

/**
 * Circle Developer Controlled Wallets — RSA-OAEP Entity Secret Encryptor
 * Encrypts 32-byte hex entity secret with Circle Public Key PEM
 * ArcPulse Ecosystem.
 */

function encryptEntitySecretWithPublicKey(publicKeyPem, customEntitySecret) {
  // Generate 32-byte random hex string if not provided
  const entitySecret = customEntitySecret || crypto.randomBytes(32).toString('hex');
  console.log("🔑 Entity Secret (32-byte hex):", entitySecret);

  if (!publicKeyPem || !publicKeyPem.includes("BEGIN PUBLIC KEY")) {
    console.warn("⚠️ Warning: Valid Circle Public Key PEM required for RSA-OAEP encryption.");
    return { entitySecret, ciphertextBase64: null };
  }

  try {
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(entitySecret, 'hex')
    );

    const ciphertextBase64 = encrypted.toString('base64');
    console.log("🔒 Encrypted Base64 Ciphertext:", ciphertextBase64);

    fs.writeFileSync('ciphertext.txt', ciphertextBase64, 'utf8');
    console.log("📁 Ciphertext saved to ciphertext.txt");

    return { entitySecret, ciphertextBase64 };
  } catch (err) {
    console.error("❌ Encryption Error:", err.message || err);
    return { entitySecret, ciphertextBase64: null };
  }
}

// CLI execution helper
if (require.main === module) {
  const samplePublicKeyPem = process.env.CIRCLE_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu... (Replace with Circle Public Key)
-----END PUBLIC KEY-----`;

  const entitySecretArg = process.env.CIRCLE_ENTITY_SECRET || "204c43bfde66206f2e510a398f5725e6e5c7f215ae4ffab072d3da455b2980a5";

  console.log("🚀 Executing Circle Entity Secret RSA-OAEP Encryption...");
  encryptEntitySecretWithPublicKey(samplePublicKeyPem, entitySecretArg);
}

module.exports = { encryptEntitySecretWithPublicKey };
