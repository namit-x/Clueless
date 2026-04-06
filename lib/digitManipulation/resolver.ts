import { Operation } from "./types";
import { GeneratorConfig, generatePuzzle } from "./generator";
import { executeOperations, DEFAULT_MAX_RESULT } from "./engine";

export interface PuzzleResult {
    number: bigint;
    operations: Operation[];
    answer: bigint;
}

/**
 * Single source of truth: generates the puzzle and computes the answer.
 * Pure, deterministic, no side effects.
 *
 * The generator already simulates executeOperations during generation to
 * guarantee bounds safety. The explicit call here re-derives the answer
 * so the resolver owns the canonical result.
 */
export function resolvePuzzle(
    teamId: string,
    roundId: string,
    config: GeneratorConfig
): PuzzleResult {
    const { number, operations } = generatePuzzle(teamId, roundId, 8);
    const maxResult = config.maxResult !== undefined
        ? BigInt(config.maxResult)
        : DEFAULT_MAX_RESULT;
    const answer = executeOperations(number, operations, maxResult);
    console.log("Answer computed by resolver:", answer.toString());
    return { number, operations, answer };
}
