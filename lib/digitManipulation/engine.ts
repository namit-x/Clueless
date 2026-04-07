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

/**
 * Rotate a string's characters left by a specified number of positions.
 *
 * @param str - The input string to rotate
 * @param k - The number of positions to rotate left; values outside the string length (including negatives) are normalized into the valid range
 * @returns The rotated string; if `str.length <= 1`, returns `str`
 */

function rotateLeft(str: string, k: number): string {
    if (str.length <= 1) return str;
    k = ((k % str.length) + str.length) % str.length;
    return str.slice(k) + str.slice(0, k);
}

/**
 * Rotates the characters of `str` to the right by `k` positions.
 *
 * If `str` has length 0 or 1, it is returned unchanged. The value of `k` may be any integer (negative values rotate left; values greater than the string length wrap around).
 *
 * @param str - The input string to rotate
 * @param k - Number of positions to rotate to the right; negative rotates left
 * @returns The resulting string after the rotation
 */
function rotateRight(str: string, k: number): string {
    if (str.length <= 1) return str;
    k = ((k % str.length) + str.length) % str.length;
    // console.log(str.slice(-k) + str.slice(0, -k));
    return str.slice(-k) + str.slice(0, -k);
}

/**
 * Reverses the characters in a string.
 *
 * @returns The input string with characters in reverse order.
 */
function reverse(str: string): string {
    // console.log(str.split("").reverse().join(""));
    return str.split("").reverse().join("");
}

/**
 * Transforms the decimal digits of an integer using the specified digit operation.
 *
 * Operates on the absolute value's decimal string, reapplies the original sign, and returns the resulting bigint. If `n` is 0, returns 0. Supported `type` values: "SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE".
 *
 * @param n - The integer whose decimal digits are transformed
 * @param type - The digit operation to apply
 * @returns The bigint produced by applying the digit transformation, preserving the input sign
 * @throws PipelineError when `type` is not a recognized digit operation
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
 * Perform the specified arithmetic operation on `n` using `operand`.
 *
 * @param n - The input value to operate on
 * @param type - The arithmetic operation to apply: `"MULTIPLY"`, `"DIVIDE"`, `"ADD"`, or `"SUBTRACT"`
 * @param operand - The operand used by the arithmetic operation
 * @returns The result of applying `type` with `operand` to `n`. For `"DIVIDE"`, division uses BigInt truncation toward zero (e.g., `7n / 2n === 3n`, `-7n / 2n === -3n`)
 * @throws PipelineError if `type` is not a recognized arithmetic operation
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
 * Validate that an operation is well-formed for execution.
 *
 * @param op - The operation to validate (type and optional operand)
 * @throws {PipelineError} "INVALID_OPERATION" if `op.type` is not allowed
 * @throws {PipelineError} "MISSING_OPERAND" if an arithmetic operation is missing its operand
 * @throws {PipelineError} "DIVISION_BY_ZERO" if a `DIVIDE` operation has an operand of `0`
 * @throws {PipelineError} "UNEXPECTED_OPERAND" if a digit operation includes an operand
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
 * Ensure a numeric operation result falls between the module's minimum and the provided maximum.
 *
 * @param result - The value to validate
 * @param step - 1-based index of the operation step that produced `result`
 * @param maxResult - Upper bound (inclusive) allowed for `result`
 * @throws PipelineError with code `RESULT_OUT_OF_BOUNDS` if `result` is less than `MIN_RESULT` or greater than `maxResult`
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
 * Apply a sequence of operations to an initial bigint, returning the result after all steps.
 *
 * Each operation is validated and applied in order; the intermediate result is checked after every step to be within [MIN_RESULT, maxResult]. Division uses BigInt truncation toward zero.
 *
 * @param initial - The starting bigint value
 * @param operations - Ordered list of operations to apply
 * @param maxResult - Upper bound for intermediate and final results (defaults to DEFAULT_MAX_RESULT)
 * @returns The final bigint result after applying all operations
 * @throws PipelineError if an operation is invalid, division by zero occurs, or a result falls outside [MIN_RESULT, maxResult]
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
