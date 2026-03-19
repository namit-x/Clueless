/**
 * Deterministic seeded PRNG for digit manipulation game.
 * Same (teamId, roundId) → same seed → same sequence. Always.
 */

/**
 * Fast 32-bit hash (FNV-1a) from a string.
 */
export function createSeed(teamId: string, roundId: string): number {
    const input = teamId + ":" + roundId;
    let hash = 0x811c9dc5; // FNV offset basis

    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193); // FNV prime
    }

    return hash >>> 0; // force unsigned 32-bit
}

/**
 * Mulberry32 PRNG. Returns a function that produces deterministic
 * floats in [0, 1) on each call.
 */
export function createRng(seed: number): () => number {
    let state = seed | 0;

    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
    };
}

/**
 * Random integer in [min, max] (inclusive).
 */
export function randomInt(rng: () => number, min: number, max: number): number {
    return min + Math.floor(rng() * (max - min + 1));
}

/**
 * Pick one element from an array.
 */
export function pickOne<T>(rng: () => number, array: readonly T[]): T {
    return array[Math.floor(rng() * array.length)];
}

/**
 * Fisher-Yates shuffle (returns new array).
 */
export function shuffle<T>(rng: () => number, array: readonly T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
