import crypto from 'crypto';
import fs from 'fs';

/**
 * Circle Entity Secret RSA-OAEP Encryptor from pubkey.pem File
 * Reads Circle Public Key from 'pubkey.pem', generates 32-byte hex entity secret,
 * and encrypts to Base64 Ciphertext using RSA-OAEP padding.
 * Built for ArcPulse Ecosystem by ProManas
 */

let publicKeyPem = '';

if (fs.existsSync('pubkey.pem')) {
  publicKeyPem = fs.readFileSync('pubkey.pem', 'utf8').trim();
} else if (process.env.CIRCLE_PUBLIC_KEY) {
  publicKeyPem = process.env.CIRCLE_PUBLIC_KEY.trim();
}

const entitySecret = process.env.CIRCLE_ENTITY_SECRET || crypto.randomBytes(32).toString('hex');
console.log("🔑 Entity Secret (32-byte hex):", entitySecret);

if (!publicKeyPem) {
  console.log("📌 Notice: Create a 'pubkey.pem' file in the root folder with your Circle Public Key to generate Base64 Ciphertext.");
} else {
  try {
    const encrypted = crypto.publicEncrypt(
      { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(entitySecret, 'hex')
    );

    console.log("🔒 Encrypted Base64 Ciphertext:", encrypted.toString('base64'));
  } catch (err) {
    console.error("❌ Encryption Error:", err.message || err);
  }
}
