import { Operation } from "./types";
import { GeneratorConfig, generatePuzzle } from "./generator";
import { executeOperations } from "./engine";

export interface PuzzleResult {
    number: bigint;
    operations: Operation[];
    answer: bigint;
}

/**
 * Single source of truth: generates the puzzle and computes the answer.
 * Pure, deterministic, no side effects.
 */
export function resolvePuzzle(
    teamId: string,
    roundId: string,
    config: GeneratorConfig
): PuzzleResult {
    const { number, operations } = generatePuzzle(teamId, roundId, config);
    const answer = executeOperations(number, operations);
    return { number, operations, answer };
}
