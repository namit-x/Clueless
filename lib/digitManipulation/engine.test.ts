import { executeOperations } from "./engine";
import { Operation } from "./types";

let passed = 0;
let failed = 0;

function assert(label: string, actual: bigint, expected: bigint) {
    if (actual === expected) {
        passed++;
    } else {
        failed++;
        console.error(`  FAIL: ${label}`);
        console.error(`    expected: ${expected}`);
        console.error(`    actual:   ${actual}`);
    }
}

function assertThrows(label: string, fn: () => void, expectedMsg?: string) {
    try {
        fn();
        failed++;
        console.error(`  FAIL: ${label} — expected error but none thrown`);
    } catch (e: any) {
        if (expectedMsg && !e.message.includes(expectedMsg)) {
            failed++;
            console.error(`  FAIL: ${label} — wrong error: ${e.message}`);
        } else {
            passed++;
        }
    }
}

// --- Basic arithmetic ---

assert("MULTIPLY",
    executeOperations(100n, [{ type: "MULTIPLY", operand: 5n }]),
    500n
);

assert("DIVIDE truncates",
    executeOperations(10n, [{ type: "DIVIDE", operand: 3n }]),
    3n
);

assert("ADD",
    executeOperations(100n, [{ type: "ADD", operand: 50n }]),
    150n
);

assert("SUBTRACT",
    executeOperations(100n, [{ type: "SUBTRACT", operand: 150n }]),
    -50n
);

// --- Digit operations ---

assert("SHIFT_LEFT: 12345 → 23451",
    executeOperations(12345n, [{ type: "SHIFT_LEFT" }]),
    23451n
);

assert("SHIFT_RIGHT: 12345 → 51234",
    executeOperations(12345n, [{ type: "SHIFT_RIGHT" }]),
    51234n
);

assert("REVERSE: 12345 → 54321",
    executeOperations(12345n, [{ type: "REVERSE" }]),
    54321n
);

// --- Negative numbers ---

assert("REVERSE negative: -12345 → -54321",
    executeOperations(-12345n, [{ type: "REVERSE" }]),
    -54321n
);

assert("SHIFT_LEFT negative: -12345 → -23451",
    executeOperations(-12345n, [{ type: "SHIFT_LEFT" }]),
    -23451n
);

assert("SHIFT_RIGHT negative: -12345 → -51234",
    executeOperations(-12345n, [{ type: "SHIFT_RIGHT" }]),
    -51234n
);

// --- Zero handling ---

assert("SHIFT_LEFT zero",
    executeOperations(0n, [{ type: "SHIFT_LEFT" }]),
    0n
);

assert("SHIFT_RIGHT zero",
    executeOperations(0n, [{ type: "SHIFT_RIGHT" }]),
    0n
);

assert("REVERSE zero",
    executeOperations(0n, [{ type: "REVERSE" }]),
    0n
);

// --- Single digit ---

assert("SHIFT_LEFT single digit",
    executeOperations(5n, [{ type: "SHIFT_LEFT" }]),
    5n
);

assert("REVERSE single digit",
    executeOperations(7n, [{ type: "REVERSE" }]),
    7n
);

// --- Leading zeros (handled by BigInt conversion) ---

assert("REVERSE with leading zeros: 10000 → 00001 → 1",
    executeOperations(10000n, [{ type: "REVERSE" }]),
    1n
);

assert("SHIFT_LEFT with trailing zeros: 12300 → 23001",
    executeOperations(12300n, [{ type: "SHIFT_LEFT" }]),
    23001n
);

// --- Division truncation toward zero ---

assert("DIVIDE negative truncates toward zero: -10 / 3 = -3",
    executeOperations(-10n, [{ type: "DIVIDE", operand: 3n }]),
    -3n
);

assert("DIVIDE negative by negative: -10 / -3 = 3",
    executeOperations(-10n, [{ type: "DIVIDE", operand: -3n }]),
    3n
);

// --- Large numbers ---

assert("Large number multiply",
    executeOperations(9999999999n, [{ type: "MULTIPLY", operand: 9999999999n }]),
    99999999980000000001n
);

assert("Large number reverse",
    executeOperations(1234567890123456789n, [{ type: "REVERSE" }]),
    9876543210987654321n
);

// --- Mixed operations chain ---

assert("Chain: 12345 → MULTIPLY 2 → 24690 → REVERSE → 9642 → ADD 100 → 9742",
    executeOperations(12345n, [
        { type: "MULTIPLY", operand: 2n },
        { type: "REVERSE" },
        { type: "ADD", operand: 100n }
    ]),
    9742n
);

assert("Chain: 99 → ADD 1 → 100 → SHIFT_LEFT → 1 → MULTIPLY 500 → 500",
    executeOperations(99n, [
        { type: "ADD", operand: 1n },
        { type: "SHIFT_LEFT" },
        { type: "MULTIPLY", operand: 500n }
    ]),
    500n
);

assert("Chain: 54321 → SHIFT_RIGHT → 15432 → SUBTRACT 10000 → 5432 → DIVIDE 2 → 2716",
    executeOperations(54321n, [
        { type: "SHIFT_RIGHT" },
        { type: "SUBTRACT", operand: 10000n },
        { type: "DIVIDE", operand: 2n }
    ]),
    2716n
);

// --- Multiple digit operations ---

assert("Double reverse returns original: 12345 → REVERSE → REVERSE → 12345",
    executeOperations(12345n, [
        { type: "REVERSE" },
        { type: "REVERSE" }
    ]),
    12345n
);

assert("SHIFT_LEFT 5 times on 5-digit = original: 12345",
    executeOperations(12345n, [
        { type: "SHIFT_LEFT" },
        { type: "SHIFT_LEFT" },
        { type: "SHIFT_LEFT" },
        { type: "SHIFT_LEFT" },
        { type: "SHIFT_LEFT" }
    ]),
    12345n
);

// --- Empty operations ---

assert("No operations returns initial",
    executeOperations(42n, []),
    42n
);

// --- Validation errors ---

assertThrows("MULTIPLY without operand",
    () => executeOperations(10n, [{ type: "MULTIPLY" } as Operation]),
    "MISSING_OPERAND"
);

assertThrows("DIVIDE by zero",
    () => executeOperations(10n, [{ type: "DIVIDE", operand: 0n }]),
    "DIVISION_BY_ZERO"
);

assertThrows("SHIFT_LEFT with operand",
    () => executeOperations(10n, [{ type: "SHIFT_LEFT", operand: 3n }]),
    "UNEXPECTED_OPERAND"
);

assertThrows("REVERSE with operand",
    () => executeOperations(10n, [{ type: "REVERSE", operand: 1n }]),
    "UNEXPECTED_OPERAND"
);

assertThrows("Unknown operation",
    () => executeOperations(10n, [{ type: "MODULO" as any }]),
    "UNKNOWN_OPERATION"
);

// --- Results ---

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
process.exit(failed > 0 ? 1 : 0);
