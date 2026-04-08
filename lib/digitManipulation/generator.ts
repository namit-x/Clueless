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
 * 🔑 ORIGINAL number generation logic (unchanged)
 * :contentReference[oaicite:0]{index=0}
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
 * Generate puzzle (deterministic per team + round)
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