import { Operation, PipelineError } from "./types";
import { createSeed, createRng, randomInt } from "./seededRng";

/**
 * Fixed operation sequence (hardcoded)
 */
const FIXED_OPERATIONS: Operation[] = [
    { type: "ADD", operand: BigInt(10023) },
    { type: "MULTIPLY", operand: BigInt(11) },
    { type: "SHIFT_LEFT" },
    { type: "SUBTRACT", operand: BigInt(8989) },
    { type: "DIVIDE", operand: BigInt(6) },
    { type: "REVERSE" },
    { type: "ADD", operand: BigInt(321) },
    { type: "DIVIDE", operand: BigInt(4) },
    { type: "SHIFT_RIGHT" },
    { type: "SUBTRACT", operand: BigInt(3221) },
];

export interface GeneratorConfig {
    digitCount: number;
    maxResult?: number;
    operationCount: number; // dummy (not used anymore)
    allowedOperations: Operation["type"][]; // dummy
    operandRange: { min: number; max: number }; // dummy
}

/**
 * Create a pseudorandom integer with the specified number of decimal digits.
 *
 * The returned value has exactly `digitCount` decimal digits and does not start with `0`.
 *
 * @param rng - A function that produces pseudorandom numbers in the range [0, 1).
 * @param digitCount - Number of decimal digits to generate; must be >= 1.
 * @returns A `bigint` representing the generated decimal number.
 * @throws PipelineError If `digitCount` is less than 1.
 */
export function generateNumber(rng: () => number, digitCount: number): bigint {
    if (digitCount < 1) {
        throw new PipelineError("INVALID_DIGIT_COUNT", "digitCount must be >= 1");
    }

    let digits = String(randomInt(rng, 1, 9)); // first digit: no leading zero

    for (let i = 1; i < digitCount; i++) {
        digits += String(randomInt(rng, 0, 9));
    }

    return BigInt(digits);
}

/**
 * Create a deterministic puzzle consisting of a numeric value and an operation sequence for a given team and round.
 *
 * The numeric value is generated with the specified number of decimal digits using an RNG seeded from `teamId` and `roundId`. The returned `operations` array is the module's fixed operation sequence.
 *
 * @param teamId - Identifier for the team used to seed the puzzle generation
 * @param roundId - Identifier for the round used to seed the puzzle generation
 * @param digitCount - Number of decimal digits to generate for the puzzle number (must be >= 1)
 * @returns An object containing `number` (the generated `bigint`) and `operations` (the fixed `Operation[]` sequence)
 */
export function generatePuzzle(
    teamId: string,
    roundId: string,
    digitCount: number
): { number: bigint; operations: Operation[] } {
    const seed = createSeed(teamId, roundId);
    const rng = createRng(seed);

    const number = generateNumber(rng, digitCount);

    return {
        number,
        operations: FIXED_OPERATIONS,
    };
}