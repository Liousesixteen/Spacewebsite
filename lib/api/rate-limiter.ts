/**
 * Token-bucket rate limiter — pure logic.
 *
 * Framework-agnostic: no Redis, no database dependencies.
 * For production use, replace the in-memory store with Redis.
 *
 * Algorithm: each key starts with a full bucket. Each request consumes
 * one token. Tokens refill at a constant rate up to the bucket capacity.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, Bucket>();

/**
 * Check if a request is allowed under the rate limit.
 * Returns { allowed: true } or { allowed: false, retryAfterMs: number }.
 */
export function checkRateLimit(params: {
  key: string;
  maxTokens: number;
  refillRatePerMinute: number;
  now?: number;
}): { allowed: boolean; retryAfterMs?: number; remaining: number } {
  const { key, maxTokens, refillRatePerMinute } = params;
  const now = params.now ?? Date.now();

  let bucket = store.get(key);

  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    store.set(key, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsedMs = now - bucket.lastRefill;
  const refillRatePerMs = refillRatePerMinute / 60000;
  const tokensToAdd = elapsedMs * refillRatePerMs;

  bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: Math.floor(bucket.tokens) };
  }

  // Time until next token is available
  const msUntilNextToken = Math.ceil((1 - bucket.tokens) / refillRatePerMs);
  return {
    allowed: false,
    retryAfterMs: msUntilNextToken,
    remaining: 0,
  };
}

/**
 * Reset rate limit state for a key (e.g. after key rotation).
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Clean up stale buckets older than the given TTL (ms).
 * Call periodically to prevent memory leaks.
 */
export function cleanupRateLimits(ttlMs: number = 600_000): void {
  const cutoff = Date.now() - ttlMs;
  const entries = Array.from(store.entries());
  for (const [key, bucket] of entries) {
    if (bucket.lastRefill < cutoff) {
      store.delete(key);
    }
  }
}
