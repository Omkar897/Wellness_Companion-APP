/**
 * AES-GCM encryption/decryption using the Web Crypto API.
 * Key is derived from a random base64 string stored in localStorage.
 */

const ALGO = 'AES-GCM';

async function getOrCreateKey(rawKey: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(rawKey), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', keyData, { name: ALGO }, false, ['encrypt', 'decrypt']);
}

export function generateEncryptionKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes));
}

export async function encrypt(plaintext: string, rawKey: string): Promise<string> {
  const key = await getOrCreateKey(rawKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded);
  // Prepend iv to ciphertext, encode as base64
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encoded: string, rawKey: string): Promise<string> {
  const key = await getOrCreateKey(rawKey);
  const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
