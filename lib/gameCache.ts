// Simple in-process cache for static game data (10 second TTL)
// Only caches rarely-changing data during active gameplay

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

const CACHE_TTL = 10000; // 10 seconds

export function getCached<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
        cache.delete(key);
        return null;
    }
    return entry.data as T;
}

export function setCached<T>(key: string, data: T): void {
    cache.set(key, {
        data,
        expiresAt: Date.now() + CACHE_TTL
    });
}

export function clearCache(): void {
    cache.clear();
}

// Cleanup expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
        if (entry.expiresAt < now) {
            cache.delete(key);
        }
    }
}, 30000); // Cleanup every 30 seconds
