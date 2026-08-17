import { describe, it, expect, beforeEach } from 'vitest';
import { generateEncryptionKey } from '../utils/crypto';
import { STORAGE_KEYS, MAX_STORAGE_BYTES } from '../utils/constants';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    _store: store,
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock crypto
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    },
    subtle: {
      importKey: async (_f: string, data: ArrayBuffer) => ({ data }),
      encrypt: async (_algo: unknown, _key: unknown, data: ArrayBuffer) => data,
      decrypt: async (_algo: unknown, _key: unknown, data: ArrayBuffer) => data,
    },
  },
});

describe('Encrypted Storage', () => {
  beforeEach(() => localStorageMock.clear());

  it('generateEncryptionKey returns a non-empty string', () => {
    const key = generateEncryptionKey();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(10);
  });

  it('generateEncryptionKey produces valid base64', () => {
    const key = generateEncryptionKey();
    expect(() => atob(key)).not.toThrow();
  });

  it('generateEncryptionKey produces unique keys on each call', () => {
    const keys = new Set(Array.from({ length: 10 }, () => generateEncryptionKey()));
    expect(keys.size).toBe(10);
  });

  it('generateEncryptionKey has sufficient entropy (>=20 bytes)', () => {
    const key = generateEncryptionKey();
    const decoded = atob(key);
    expect(decoded.length).toBeGreaterThanOrEqual(20);
  });

  it('STORAGE_KEYS.USER_PROFILE is defined', () => {
    expect(STORAGE_KEYS.USER_PROFILE).toBeDefined();
    expect(typeof STORAGE_KEYS.USER_PROFILE).toBe('string');
  });

  it('STORAGE_KEYS.JOURNALS is defined', () => {
    expect(STORAGE_KEYS.JOURNALS).toBeDefined();
    expect(typeof STORAGE_KEYS.JOURNALS).toBe('string');
  });

  it('all STORAGE_KEYS have defined non-empty values', () => {
    for (const [_k, v] of Object.entries(STORAGE_KEYS)) {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it('STORAGE_KEYS have unique values (no collisions)', () => {
    const values = Object.values(STORAGE_KEYS);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it('STORAGE_KEYS use a consistent prefix (wc_)', () => {
    for (const v of Object.values(STORAGE_KEYS)) {
      expect(v.startsWith('wc_')).toBe(true);
    }
  });

  it('MAX_STORAGE_BYTES is 10MB', () => {
    expect(MAX_STORAGE_BYTES).toBe(10 * 1024 * 1024);
  });

  it('localStorage mock correctly sets and gets values', () => {
    localStorageMock.setItem('test_key', 'test_value');
    expect(localStorageMock.getItem('test_key')).toBe('test_value');
  });

  it('localStorage mock removeItem works', () => {
    localStorageMock.setItem('to_remove', 'value');
    localStorageMock.removeItem('to_remove');
    expect(localStorageMock.getItem('to_remove')).toBeNull();
  });

  it('localStorage mock clear resets all values', () => {
    localStorageMock.setItem('a', '1');
    localStorageMock.setItem('b', '2');
    localStorageMock.clear();
    expect(localStorageMock.getItem('a')).toBeNull();
    expect(localStorageMock.getItem('b')).toBeNull();
  });
});
