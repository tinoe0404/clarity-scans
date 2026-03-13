// src/lib/rateLimit.ts
// Exported generic tracking logic supporting Phase 15 & 16 Memory-mapped security checks

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

const limitStore = new Map<string, RateLimitRecord>();

export interface RateLimitStatus {
  success: boolean;
  retryAfterSeconds: number;
}

/**
 * Checks if a given identifier (IP or User ID) has exceeded the threshold in the given Window.
 * Auto-cleans stale keys periodically.
 *
 * @param identifier the unique key to track (e.g. string IP, string Session ID)
 * @param maxRequests the maximum request hit counter (e.g. 50 max allowed)
 * @param windowMs the exact loop width mapping the cache lock (e.g. 1 hr map)
 */
export function enforceRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitStatus {
  const now = Date.now();

  // Pseudo-random 5% chance to flush stale memory elements mapping natively reducing leaks natively
  if (Math.random() < 0.05) {
    for (const [key, val] of Array.from(limitStore.entries())) {
      if (now > val.expiresAt) limitStore.delete(key);
    }
  }

  const record = limitStore.get(identifier);

  if (!record || now > record.expiresAt) {
    limitStore.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { success: true, retryAfterSeconds: 0 };
  }

  if (record.count >= maxRequests) {
    const secondsRemaining = Math.max(0, Math.ceil((record.expiresAt - now) / 1000));
    return { success: false, retryAfterSeconds: secondsRemaining };
  }

  record.count += 1;
  return { success: true, retryAfterSeconds: 0 };
}
