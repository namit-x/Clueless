import { Operation, OperationType } from "./types";
import { createSeed, createRng, randomInt, pickOne } from "./seededRng";

const ARITHMETIC_OPS: Set<OperationType> = new Set([
    "MULTIPLY", "DIVIDE", "ADD", "SUBTRACT"
]);

export interface GeneratorConfig {
    digitCount: number;
    operationCount: number;
    allowedOperations: OperationType[];
    operandRange: { min: number; max: number };
}

/**
 * Generate a number with exactly `digitCount` digits.
 * First digit is always 1–9; remaining digits are 0–9.
 */
export function generateNumber(rng: () => number, digitCount: number): bigint {
    if (digitCount < 1) throw new Error("INVALID_DIGIT_COUNT");

    let digits = String(randomInt(rng, 1, 9)); // first digit: no leading zero

    for (let i = 1; i < digitCount; i++) {
        digits += String(randomInt(rng, 0, 9));
    }

    return BigInt(digits);
}

/**
 * Generate a deterministic ordered list of operations from config.
 */
export function generateOperations(rng: () => number, config: GeneratorConfig): Operation[] {
    const { operationCount, allowedOperations, operandRange } = config;
    const operations: Operation[] = [];

    for (let i = 0; i < operationCount; i++) {
        const type = pickOne(rng, allowedOperations);

        if (ARITHMETIC_OPS.has(type)) {
            let min = operandRange.min;
            let max = operandRange.max;

            // Division: operand must be >= 2 to avoid div-by-zero
            if (type === "DIVIDE") {
                min = Math.max(min, 2);
            }

            // Multiply: cap operand to prevent number explosion
            if (type === "MULTIPLY") {
                max = Math.min(max, 20);
            }

            operations.push({ type, operand: BigInt(randomInt(rng, min, max)) });
        } else {
            operations.push({ type });
        }
    }

    return operations;
}

/**
 * Generate a complete puzzle (number + operations) from team/round IDs and config.
 * Pure and deterministic: same inputs → same output, always.
 */
export function generatePuzzle(
    teamId: string,
    roundId: string,
    config: GeneratorConfig
): { number: bigint; operations: Operation[] } {
    const seed = createSeed(teamId, roundId);
    const rng = createRng(seed);

    const number = generateNumber(rng, config.digitCount);
    const operations = generateOperations(rng, config);

    return { number, operations };
}
