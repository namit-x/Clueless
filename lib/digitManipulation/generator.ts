import { Operation, OperationType, VALID_OPERATION_TYPES, ARITHMETIC_OPS, PipelineError } from "./types";
import { createSeed, createRng, randomInt, pickOne } from "./seededRng";
import { executeOperations, DEFAULT_MAX_RESULT } from "./engine";

export interface GeneratorConfig {
    digitCount: number;
    operationCount: number;
    allowedOperations: OperationType[];
    operandRange: { min: number; max: number };
    /** Optional upper bound for results. Defaults to DEFAULT_MAX_RESULT (1,000,000). */
    maxResult?: number;
}

/** Maximum multiplier operand — prevents number explosion. */
const MULTIPLY_CAP = 20;

/** Minimum divisor — prevents division by zero and trivial div-by-1. */
const DIVIDE_MIN = 2;

/** Maximum retry attempts when a generated sequence violates bounds. */
const MAX_GENERATION_ATTEMPTS = 50;

/**
 * Generate a number with exactly `digitCount` digits.
 * First digit is always 1–9; remaining digits are 0–9.
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
 * Validate that all allowedOperations in config are recognized types.
 */
function validateAllowedOperations(allowedOperations: OperationType[]): void {
    for (const op of allowedOperations) {
        if (!VALID_OPERATION_TYPES.has(op)) {
            throw new PipelineError(
                "INVALID_OPERATION",
                `Operation "${op}" is not allowed. Valid: ${Array.from(VALID_OPERATION_TYPES).join(", ")}`
            );
        }
    }
}

/**
 * Generate a single random operation with safe operand constraints.
 * Arithmetic ops get a bounded operand; digit ops get none.
 */
function generateSingleOperation(
    rng: () => number,
    type: OperationType,
    operandRange: { min: number; max: number }
): Operation {
    // Digit ops: no operand needed
    if (!ARITHMETIC_OPS.has(type)) {
        return { type };
    }

    let min = operandRange.min;
    let max = operandRange.max;

    // Division: operand must be >= 2 to avoid div-by-zero and trivial div-by-1
    if (type === "DIVIDE") {
        min = Math.max(min, DIVIDE_MIN);
    }

    // Multiply: cap operand to prevent number explosion
    if (type === "MULTIPLY") {
        max = Math.min(max, MULTIPLY_CAP);
    }

    // Ensure min <= max after applying constraints
    if (min > max) {
        throw new PipelineError(
            "INVALID_OPERAND_RANGE",
            `Operand range [${min}, ${max}] is invalid for ${type} after applying safety constraints`
        );
    }

    return { type, operand: BigInt(randomInt(rng, min, max)) };
}

/**
 * Generate a deterministic ordered list of operations from config.
 */
function generateOperationSequence(
    rng: () => number,
    config: GeneratorConfig
): Operation[] {
    const { operationCount, allowedOperations, operandRange } = config;
    const operations: Operation[] = [];

    for (let i = 0; i < operationCount; i++) {
        const type = pickOne(rng, allowedOperations);
        operations.push(generateSingleOperation(rng, type, operandRange));
    }

    return operations;
}

/**
 * Generate a complete puzzle (number + operations) that is guaranteed to stay
 * within bounds at every intermediate step.
 *
 * Pure and deterministic: same (teamId, roundId, config) → same output, always.
 *
 * Uses simulation: after generating a candidate sequence, runs executeOperations
 * to verify all intermediate results stay within [MIN_RESULT, maxResult].
 * If a sequence violates bounds, the RNG advances and a new candidate is tried,
 * up to MAX_GENERATION_ATTEMPTS. This is still deterministic — the RNG state
 * determines which attempt succeeds.
 *
 * @throws PipelineError if no valid sequence is found after MAX_GENERATION_ATTEMPTS
 */
export function generatePuzzle(
    teamId: string,
    roundId: string,
    config: GeneratorConfig
): { number: bigint; operations: Operation[] } {
    validateAllowedOperations(config.allowedOperations);

    const seed = createSeed(teamId, roundId);
    const rng = createRng(seed);
    const maxResult = config.maxResult !== undefined
        ? BigInt(config.maxResult)
        : DEFAULT_MAX_RESULT;

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
        const number = generateNumber(rng, config.digitCount);
        const operations = generateOperationSequence(rng, config);

        try {
            // Simulate — if this doesn't throw, the sequence is safe
            executeOperations(number, operations, maxResult);
            return { number, operations };
        } catch {
            // Bounds violation — advance RNG and retry
            continue;
        }
    }

    throw new PipelineError(
        "GENERATION_FAILED",
        `Could not generate a valid puzzle within ${MAX_GENERATION_ATTEMPTS} attempts. ` +
        `Config may be too restrictive or bounds too tight.`
    );
}
