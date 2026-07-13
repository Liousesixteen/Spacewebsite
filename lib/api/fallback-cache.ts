/**
 * Fallback cache — serves the last known good data when sources are unavailable.
 *
 * Stores recent successful API responses in memory with timestamps.
 * In production, use Redis or a persistent store for cross-instance sharing.
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
  version: string;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Store a value in the fallback cache.
 */
export function setFallback<T>(key: string, data: T, ttlMs: number = 30 * 60 * 1000): void {
  cache.set(key, {
    data,
    cachedAt: Date.now(),
    ttlMs,
    version: '1.0',
  });

  // Limit cache size
  if (cache.size > 50) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);
    if (entries[0]) cache.delete(entries[0][0]);
  }
}

/**
 * Retrieve a value from the fallback cache.
 * Returns null if not found or expired.
 */
export function getFallback<T>(key: string): { data: T; ageMs: number } | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const ageMs = Date.now() - entry.cachedAt;
  if (ageMs > entry.ttlMs) {
    cache.delete(key);
    return null;
  }

  return { data: entry.data as T, ageMs };
}

/**
 * Remove a specific cache entry.
 */
export function invalidateFallback(key: string): void {
  cache.delete(key);
}

/**
 * Get cache stats for monitoring.
 */
export function getFallbackStats(): {
  entries: number;
  keys: string[];
} {
  return {
    entries: cache.size,
    keys: Array.from(cache.keys()),
  };
}

/**
 * Build a cache key for an API endpoint.
 */
export function cacheKey(endpoint: string, params?: Record<string, string>): string {
  if (!params) return endpoint;
  const qs = new URLSearchParams(params).toString();
  return `${endpoint}?${qs}`;
}
