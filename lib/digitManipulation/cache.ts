import { Operation } from "./types";
import { GeneratorConfig } from "./generator";
import { resolvePuzzle, PuzzleResult } from "./resolver";

interface CacheEntry {
    number: bigint;
    operations: Operation[];
    answer: bigint;
    expiresAt: number;
}

const puzzleCache = new Map<string, CacheEntry>();

const TTL = 5 * 60 * 1000; // 5 minutes

function cacheKey(teamId: string, roundId: string): string {
    return `digit:${teamId}:${roundId}`;
}

export function getCachedPuzzle(teamId: string, roundId: string): PuzzleResult | null {
    const entry = puzzleCache.get(cacheKey(teamId, roundId));
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
        puzzleCache.delete(cacheKey(teamId, roundId));
        return null;
    }

    return { number: entry.number, operations: entry.operations, answer: entry.answer };
}

export function setCachedPuzzle(teamId: string, roundId: string, value: PuzzleResult): void {
    puzzleCache.set(cacheKey(teamId, roundId), {
        number: value.number,
        operations: value.operations,
        answer: value.answer,
        expiresAt: Date.now() + TTL
    });
}

/**
 * Returns cached puzzle if available, otherwise resolves, caches, and returns.
 * Cache is optional optimization — resolvePuzzle is always the source of truth.
 */
export function getOrResolvePuzzle(
    teamId: string,
    roundId: string,
    config: GeneratorConfig
): PuzzleResult {
    const cached = getCachedPuzzle(teamId, roundId);
    if (cached) return cached;

    const result = resolvePuzzle(teamId, roundId, config);
    setCachedPuzzle(teamId, roundId, result);
    return result;
}

/** Exposed for testing only. */
export function clearPuzzleCache(): void {
    puzzleCache.clear();
}
