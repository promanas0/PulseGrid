import crypto from 'crypto';

/**
 * Standalone Circle Entity Secret RSA-OAEP Encryptor
 * Encrypts a 32-byte random entity secret with Circle Public Key
 * Built for ArcPulse Ecosystem by ProManas
 */

const publicKeyPem = process.env.CIRCLE_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890...
-----END PUBLIC KEY-----`;

const entitySecret = process.env.CIRCLE_ENTITY_SECRET || crypto.randomBytes(32).toString('hex');
console.log("Entity Secret:", entitySecret);

try {
  const encrypted = crypto.publicEncrypt(
    { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(entitySecret, 'hex')
  );

  console.log("Ciphertext (Base64):", encrypted.toString('base64'));
} catch (err) {
  console.log("📌 Encryption Status: Replace publicKeyPem string with Circle Public Key to generate Ciphertext!");
}
