import {
    Operation, OperationType,
    VALID_OPERATION_TYPES, ARITHMETIC_OPS, DIGIT_OPS,
    PipelineError
} from "./types";

// ─── Global result bounds ────────────────────────────────────────────────────

/** Minimum allowed result after any operation step. */
export const MIN_RESULT = BigInt(0);

/** Default maximum allowed result after any operation step. */
export const DEFAULT_MAX_RESULT = BigInt(1_000_000_000);

// ─── Digit operation helpers (pure string transforms) ────────────────────────

function rotateLeft(str: string, k: number): string {
    if (str.length <= 1) return str;
    k = ((k % str.length) + str.length) % str.length;
    console.log(str.slice(k) + str.slice(0, k));
    return str.slice(k) + str.slice(0, k);
}

function rotateRight(str: string, k: number): string {
    if (str.length <= 1) return str;
    k = ((k % str.length) + str.length) % str.length;
    console.log(str.slice(-k) + str.slice(0, -k));
    return str.slice(-k) + str.slice(0, -k);
}

function reverse(str: string): string {
    console.log(str.split("").reverse().join(""));
    return str.split("").reverse().join("");
}

/**
 * Apply a digit-manipulation operation. These are pure transforms on the
 * decimal digit string — they cannot cause overflow or produce negative results
 * from positive inputs.
 */
function applyDigitOperation(n: bigint, type: OperationType): bigint {
    if (n === BigInt(0)) return BigInt(0);

    const negative = n < BigInt(0);
    const digits = (negative ? -n : n).toString();

    let result: string;
    switch (type) {
        case "SHIFT_LEFT":
            result = rotateLeft(digits, 1);
            break;
        case "SHIFT_RIGHT":
            result = rotateRight(digits, 1);
            break;
        case "REVERSE":
            result = reverse(digits);
            break;
        default:
            throw new PipelineError(
                "UNKNOWN_OPERATION",
                `Unrecognized digit operation: ${type}`
            );
    }

    const value = BigInt(result);
    return negative ? -value : value;
}

// ─── Arithmetic operation ────────────────────────────────────────────────────

/**
 * Apply a single arithmetic operation.
 *
 * Division uses **BigInt truncation toward zero** (standard ECMAScript BigInt
 * semantics): 7n / 2n = 3n, -7n / 2n = -3n. This matches mathematical
 * truncation, NOT floor division.
 */
function applyArithmeticOperation(n: bigint, type: OperationType, operand: bigint): bigint {
    switch (type) {
        case "MULTIPLY":
            return n * operand;
        case "DIVIDE":
            // BigInt division truncates toward zero (ECMAScript spec).
            // e.g. 7n / 2n = 3n, -7n / 2n = -3n
            return n / operand;
        case "ADD":
            return n + operand;
        case "SUBTRACT":
            return n - operand;
        default:
            throw new PipelineError(
                "UNKNOWN_OPERATION",
                `Unrecognized arithmetic operation: ${type}`
            );
    }
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Validate a single operation before execution.
 * Arithmetic ops: must have operand, division must not be by zero.
 * Digit ops: must NOT have operand.
 */
function validateOperation(op: Operation): void {
    if (!VALID_OPERATION_TYPES.has(op.type)) {
        throw new PipelineError(
            "INVALID_OPERATION",
            `Operation type "${op.type}" is not allowed. Valid: ${Array.from(VALID_OPERATION_TYPES).join(", ")}`
        );
    }

    if (ARITHMETIC_OPS.has(op.type)) {
        if (op.operand === undefined || op.operand === null) {
            throw new PipelineError(
                "MISSING_OPERAND",
                `${op.type} requires a numeric operand`
            );
        }
        if (op.type === "DIVIDE" && op.operand === BigInt(0)) {
            throw new PipelineError(
                "DIVISION_BY_ZERO",
                "Division by zero is not allowed"
            );
        }
    }

    if (DIGIT_OPS.has(op.type)) {
        if (op.operand !== undefined && op.operand !== null) {
            throw new PipelineError(
                "UNEXPECTED_OPERAND",
                `${op.type} must not have an operand`
            );
        }
    }
}

/**
 * Assert that a result is within [MIN_RESULT, maxResult].
 */
function assertBounds(result: bigint, step: number, maxResult: bigint): void {
    if (result < MIN_RESULT) {
        throw new PipelineError(
            "RESULT_OUT_OF_BOUNDS",
            `Result ${result} after step ${step} is below minimum ${MIN_RESULT}`
        );
    }
    if (result > maxResult) {
        throw new PipelineError(
            "RESULT_OUT_OF_BOUNDS",
            `Result ${result} after step ${step} exceeds maximum ${maxResult}`
        );
    }
}

// ─── Main pipeline ───────────────────────────────────────────────────────────

/**
 * Execute a fixed sequence of operations on an initial value.
 *
 * Pure function: no side effects, no external state.
 * Deterministic: same (initial, operations, maxResult) → same result, always.
 *
 * After each step, the result is bounds-checked against [MIN_RESULT, maxResult].
 * Division uses BigInt truncation toward zero (not floor).
 *
 * @param initial    Starting number
 * @param operations Ordered list of operations to apply
 * @param maxResult  Upper bound for intermediate/final results (default: 1,000,000)
 * @returns Final result after all operations
 * @throws PipelineError on invalid operation, division by zero, or bounds violation
 */
export function executeOperations(
    initial: bigint,
    operations: Operation[],
    maxResult: bigint = DEFAULT_MAX_RESULT
): bigint {
    let result = initial;

    for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        validateOperation(op);

        if (DIGIT_OPS.has(op.type)) {
            result = applyDigitOperation(result, op.type);
        } else {
            result = applyArithmeticOperation(result, op.type, op.operand!);
        }

        assertBounds(result, i + 1, maxResult);
    }

    return result;
}
