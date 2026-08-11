import crypto from 'crypto';
import fs from 'fs';

/**
 * Circle Entity Secret RSA-OAEP Encryptor from pubkey.pem File
 * Reads Circle Public Key from 'pubkey.pem', generates 32-byte hex entity secret,
 * and encrypts to Base64 Ciphertext using RSA-OAEP padding.
 * Built for ArcPulse Ecosystem by ProManas
 */

function loadPublicKeyPem() {
  const candidateFiles = ['publickey.txt', 'pubkey.pem'];

  for (const file of candidateFiles) {
    if (fs.existsSync(file)) {
      try {
        let content = fs.readFileSync(file, 'utf16le');
        if (!content.includes('BEGIN PUBLIC KEY')) {
          content = fs.readFileSync(file, 'utf8');
        }
        content = content.replace(/^\uFEFF/, '').trim();
        if (content.includes('BEGIN PUBLIC KEY')) {
          return content;
        }
      } catch (e) {}
    }
  }

  return (process.env.CIRCLE_PUBLIC_KEY || '').trim();
}

const publicKeyPem = loadPublicKeyPem();

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

    const ciphertextBase64 = encrypted.toString('base64');
    console.log("🔒 Encrypted Base64 Ciphertext:", ciphertextBase64);

    fs.writeFileSync('ciphertext.txt', ciphertextBase64, 'utf8');
    console.log("📁 Ciphertext saved to ciphertext.txt");
  } catch (err) {
    console.error("❌ Encryption Error:", err.message || err);
  }
}
