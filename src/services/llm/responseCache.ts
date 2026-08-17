/**
 * In-memory LRU cache for AI responses.
 * Keyed by a hash of the request payload.
 * Entries expire after TTL_MS.
 */

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ENTRIES = 50;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class ResponseCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    // LRU: re-insert to make it most-recent
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.store.size >= MAX_ENTRIES) {
      // Evict oldest entry
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + TTL_MS });
  }

  clear(): void {
    this.store.clear();
  }
}

export function cacheKey(parts: unknown[]): string {
  return JSON.stringify(parts).slice(0, 512);
}

import type { EmotionData } from '../../types/emotion';
import type { WellnessResponse } from '../../types/ai';

export const emotionCache = new ResponseCache<EmotionData>();
export const wellnessCache = new ResponseCache<WellnessResponse>();
