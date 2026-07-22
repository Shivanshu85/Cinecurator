/**
 * High-performance, zero-dependency in-memory LRU cache with TTL
 * for Node.js / Next.js server-side API responses & image proxying.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class SimpleLRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxEntries: number;
  private defaultTTLMs: number;

  constructor(maxEntries = 500, defaultTTLMs = 24 * 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTTLMs = defaultTTLMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order (delete and re-insert)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first key in map iteration)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const expiresAt = Date.now() + (ttlMs ?? this.defaultTTLMs);
    this.cache.set(key, { value, expiresAt });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Shared singleton cache instances for OMDb, TMDB, recommendations, and images
export const omdbCache = new SimpleLRUCache<any>(1000, 12 * 60 * 60 * 1000); // 12 hours
export const tmdbCache = new SimpleLRUCache<any>(1000, 12 * 60 * 60 * 1000); // 12 hours
export const recommendationCache = new SimpleLRUCache<any>(500, 6 * 60 * 60 * 1000); // 6 hours
export const tmdbImageCache = new SimpleLRUCache<{ body: ArrayBuffer; contentType: string }>(
  300,
  24 * 60 * 60 * 1000
); // 24 hours for images
