import { encrypt, decrypt, generateEncryptionKey } from '../../utils/crypto';
import { STORAGE_KEYS, MAX_STORAGE_BYTES } from '../../utils/constants';

function getOrCreateEncryptionKey(): string {
  let key = localStorage.getItem(STORAGE_KEYS.ENCRYPTION_KEY);
  if (!key) {
    key = generateEncryptionKey();
    localStorage.setItem(STORAGE_KEYS.ENCRYPTION_KEY, key);
  }
  return key;
}

export async function secureSet<T>(key: string, value: T): Promise<void> {
  const serialized = JSON.stringify(value);
  const encKey = getOrCreateEncryptionKey();
  const encrypted = await encrypt(serialized, encKey);

  // Check storage limit
  const currentUsage = JSON.stringify(localStorage).length;
  if (currentUsage + encrypted.length > MAX_STORAGE_BYTES) {
    throw new Error('Storage limit reached (10MB). Please export and clear old data.');
  }

  localStorage.setItem(key, encrypted);
}

export async function secureGet<T>(key: string): Promise<T | null> {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  const encKey = getOrCreateEncryptionKey();
  try {
    const decrypted = await decrypt(encrypted, encKey);
    return JSON.parse(decrypted) as T;
  } catch {
    // Corrupted data
    localStorage.removeItem(key);
    return null;
  }
}

export function secureRemove(key: string): void {
  localStorage.removeItem(key);
}

export function getStorageUsageBytes(): number {
  return new Blob([JSON.stringify(localStorage)]).size;
}
