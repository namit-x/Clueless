type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory IP-based rate limiter.
 * Works correctly for single-process deployments (Railway).
 *
 * @param key      - Unique key per IP+endpoint (e.g. `login:1.2.3.4`)
 * @param max      - Max requests allowed in the window
 * @param windowMs - Rolling window in milliseconds
 */
export function rateLimit(
    key: string,
    max: number,
    windowMs: number
): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterMs: 0 };
    }

    if (entry.count >= max) {
        return { allowed: false, retryAfterMs: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, retryAfterMs: 0 };
}
