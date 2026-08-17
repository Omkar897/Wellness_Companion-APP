import { describe, it, expect, beforeEach } from 'vitest';
import { generateEncryptionKey } from '../utils/crypto';
import { STORAGE_KEYS } from '../utils/constants';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
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

  it('generates encryption key as base64 string', () => {
    const key = generateEncryptionKey();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(10);
    // Should be valid base64
    expect(() => atob(key)).not.toThrow();
  });

  it('STORAGE_KEYS are all defined', () => {
    expect(STORAGE_KEYS.USER_PROFILE).toBeDefined();
    expect(STORAGE_KEYS.JOURNALS).toBeDefined();
    expect(STORAGE_KEYS.PERSONAL_CONTEXT).toBeDefined();
    expect(STORAGE_KEYS.SETTINGS).toBeDefined();
  });

  it('STORAGE_KEYS have unique values', () => {
    const values = Object.values(STORAGE_KEYS);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

