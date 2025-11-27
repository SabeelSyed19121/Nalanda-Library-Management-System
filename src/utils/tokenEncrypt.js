// const crypto = require('crypto');

// const ALGO = 'aes-256-cbc';

// function getKeyIV(key) {
  
//   const k = Buffer.from(key, 'utf8');
  
//   const iv = k.slice(0, 16);
//   return { key: k, iv };
// }

// function encrypt(text, encryptionKey) {
//   const { key, iv } = getKeyIV(encryptionKey);
//   const cipher = crypto.createCipheriv(ALGO, key, iv);
//   let encrypted = cipher.update(text, 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return encrypted;
// }

// function decrypt(encryptedHex, encryptionKey) {
//   const { key, iv } = getKeyIV(encryptionKey);
//   const decipher = crypto.createDecipheriv(ALGO, key, iv);
//   let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }

// module.exports = { encrypt, decrypt };












// src/utils/tokenEncrypt.js
// Simple, safe AES-256-CBC encrypt/decrypt helpers.
// - Derives a 32-byte key from the provided secret using SHA-256.
// - Uses a random 16-byte IV for each encryption.
// - Returns base64: iv:ciphertext (both base64-encoded and joined by a colon).
// - Expects `secret` to be any non-empty string (will be hashed).

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
 * Derive a 32-byte key from any secret string using SHA-256.
 * This ensures the key length is valid for aes-256-cbc.
 * @param {string} secret
 * @returns {Buffer} 32-byte key
 */
function deriveKey(secret) {
  if (!secret || typeof secret !== 'string') {
    throw new Error('Encryption secret must be a non-empty string');
  }
  return crypto.createHash('sha256').update(secret).digest(); // 32 bytes
}

/**
 * Encrypt plaintext using AES-256-CBC.
 * Returns a single base64 string containing iv and ciphertext:
 *   base64(iv) + ':' + base64(ciphertext)
 *
 * @param {string} plaintext
 * @param {string} secret
 * @returns {string} base64(iv):base64(ciphertext)
 */
function encrypt(plaintext, secret) {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  // encode iv and ciphertext as base64 and join with colon
  return `${iv.toString('base64')}:${encrypted.toString('base64')}`;
}

/**
 * Decrypt a token produced by `encrypt`.
 * Expects input in the format: base64(iv):base64(ciphertext)
 *
 * @param {string} payload
 * @param {string} secret
 * @returns {string} decrypted plaintext
 */
function decrypt(payload, secret) {
  if (!payload || typeof payload !== 'string') {
    throw new Error('Invalid payload for decrypt');
  }
  const key = deriveKey(secret);
  const parts = payload.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid payload format');
  }
  const iv = Buffer.from(parts[0], 'base64');
  const encrypted = Buffer.from(parts[1], 'base64');
  if (iv.length !== IV_LENGTH) {
    throw new Error('Invalid IV length');
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
