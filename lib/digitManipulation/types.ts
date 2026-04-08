/**
 * All supported operation types in the computation pipeline.
 *
 * Arithmetic: ADD, SUBTRACT, MULTIPLY, DIVIDE — require a numeric operand.
 * Digit:      SHIFT_LEFT, SHIFT_RIGHT, REVERSE — pure digit transforms, no operand.
 */
export type OperationType =
    | "MULTIPLY"
    | "DIVIDE"
    | "ADD"
    | "SUBTRACT"
    | "SHIFT_LEFT"
    | "SHIFT_RIGHT"
    | "REVERSE";

/** Runtime set of all valid operation types, for validation at system boundaries. */
export const VALID_OPERATION_TYPES = new Set<OperationType>([
    "MULTIPLY", "DIVIDE", "ADD", "SUBTRACT",
    "SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE"
]);

/** Operations that require a numeric operand. */
export const ARITHMETIC_OPS = new Set<OperationType>([
    "MULTIPLY", "DIVIDE", "ADD", "SUBTRACT"
]);

/** Operations that are pure digit transforms (no operand). */
export const DIGIT_OPS = new Set<OperationType>([
    "SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE"
]);

/**
 * A single operation in the computation pipeline.
 * Arithmetic ops require operand; digit ops must NOT have one.
 */
export type Operation = {
    type: OperationType;
    operand?: bigint;
};

/**
 * Structured error thrown by engine and generator.
 * Carries a machine-readable `error` code and a human-readable `message`.
 */
export class PipelineError extends Error {
    public readonly error: string;

    constructor(error: string, message: string) {
        super(message);
        this.error = error;
        this.name = "PipelineError";
    }
}
