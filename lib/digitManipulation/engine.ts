import { Operation, OperationType } from "./types";

const ARITHMETIC_OPS: Set<OperationType> = new Set([
    "MULTIPLY", "DIVIDE", "ADD", "SUBTRACT"
]);

const DIGIT_OPS: Set<OperationType> = new Set([
    "SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE"
]);

function rotateLeft(str: string, k: number): string {
    if (str.length <= 1) return str;
    k = ((k % str.length) + str.length) % str.length;
    return str.slice(k) + str.slice(0, k);
}

function rotateRight(str: string, k: number): string {
    if (str.length <= 1) return str;
    k = ((k % str.length) + str.length) % str.length;
    return str.slice(-k) + str.slice(0, -k);
}

function reverse(str: string): string {
    return str.split("").reverse().join("");
}

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
            throw new Error(`UNKNOWN_DIGIT_OPERATION: ${type}`);
    }

    const value = BigInt(result);
    return negative ? -value : value;
}

function applyArithmeticOperation(n: bigint, type: OperationType, operand: bigint): bigint {
    switch (type) {
        case "MULTIPLY":
            return n * operand;
        case "DIVIDE":
            return n / operand;
        case "ADD":
            return n + operand;
        case "SUBTRACT":
            return n - operand;
        default:
            throw new Error(`UNKNOWN_ARITHMETIC_OPERATION: ${type}`);
    }
}

function validateOperation(op: Operation): void {
    if (ARITHMETIC_OPS.has(op.type)) {
        if (op.operand === undefined || op.operand === null) {
            throw new Error(`MISSING_OPERAND: ${op.type} requires an operand`);
        }
        if (op.type === "DIVIDE" && op.operand === BigInt(0)) {
            throw new Error("DIVISION_BY_ZERO");
        }
    }

    if (DIGIT_OPS.has(op.type)) {
        if (op.operand !== undefined && op.operand !== null) {
            throw new Error(`UNEXPECTED_OPERAND: ${op.type} must not have an operand`);
        }
    }

    if (!ARITHMETIC_OPS.has(op.type) && !DIGIT_OPS.has(op.type)) {
        throw new Error(`UNKNOWN_OPERATION: ${op.type}`);
    }
}

export function executeOperations(initial: bigint, operations: Operation[]): bigint {
    let result = initial;

    for (const op of operations) {
        validateOperation(op);

        if (DIGIT_OPS.has(op.type)) {
            result = applyDigitOperation(result, op.type);
        } else {
            result = applyArithmeticOperation(result, op.type, op.operand!);
        }
    }

    return result;
}
