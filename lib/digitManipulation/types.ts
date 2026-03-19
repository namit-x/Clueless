export type OperationType =
    | "MULTIPLY"
    | "DIVIDE"
    | "ADD"
    | "SUBTRACT"
    | "SHIFT_LEFT"
    | "SHIFT_RIGHT"
    | "REVERSE";

export type Operation = {
    type: OperationType;
    operand?: bigint;
};
