import { Operation } from "./types";
import { GeneratorConfig, generatePuzzle } from "./generator";
import { executeOperations, DEFAULT_MAX_RESULT } from "./engine";

export interface PuzzleResult {
    number: bigint;
    operations: Operation[];
    answer: bigint;
}

/**
 * Generate a puzzle for the given team and round and compute its canonical answer within the configured numeric bound.
 *
 * If `config.maxResult` is provided it will be used (converted to `BigInt`) as the bound for computing the answer; otherwise `DEFAULT_MAX_RESULT` is used.
 *
 * @param teamId - Identifier for the team the puzzle is generated for
 * @param roundId - Identifier for the round the puzzle is generated for
 * @param config - Generator configuration; `config.maxResult` (when present) sets the numeric bound for the computed answer
 * @returns The puzzle result containing `number` (starting value), `operations` (operation sequence), and `answer` (final computed result)
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
    // console.log("Answer computed by resolver:", answer.toString());
    return { number, operations, answer };
}
