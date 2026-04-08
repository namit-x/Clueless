import { executeOperations, DEFAULT_MAX_RESULT } from "./engine";
import { Operation } from "./types";
import { PipelineError } from "./types";

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

function assertThrows(label: string, fn: () => void, expectedCode?: string) {
    try {
        fn();
        failed++;
        console.error(`  FAIL: ${label} — expected error but none thrown`);
    } catch (e: any) {
        if (expectedCode && !(e instanceof PipelineError && e.error === expectedCode)) {
            failed++;
            console.error(`  FAIL: ${label} — wrong error code: ${e.error ?? e.message}, expected ${expectedCode}`);
        } else {
            passed++;
        }
    }
}

// Use a large maxResult for basic arithmetic tests so bounds don't interfere
const BIG = BigInt(10) ** BigInt(30);

// --- Basic arithmetic ---

assert("MULTIPLY",
    executeOperations(BigInt(100), [{ type: "MULTIPLY", operand: BigInt(5) }], BIG),
    BigInt(500)
);

assert("DIVIDE truncates",
    executeOperations(BigInt(10), [{ type: "DIVIDE", operand: BigInt(3) }], BIG),
    BigInt(3)
);

assert("ADD",
    executeOperations(BigInt(100), [{ type: "ADD", operand: BigInt(50) }], BIG),
    BigInt(150)
);

assert("SUBTRACT",
    executeOperations(BigInt(100), [{ type: "SUBTRACT", operand: BigInt(30) }], BIG),
    BigInt(70)
);

// --- Digit operations ---

assert("SHIFT_LEFT: 12345 → 23451",
    executeOperations(BigInt(12345), [{ type: "SHIFT_LEFT" }]),
    BigInt(23451)
);

assert("SHIFT_RIGHT: 12345 → 51234",
    executeOperations(BigInt(12345), [{ type: "SHIFT_RIGHT" }]),
    BigInt(51234)
);

assert("REVERSE: 12345 → 54321",
    executeOperations(BigInt(12345), [{ type: "REVERSE" }]),
    BigInt(54321)
);

// --- SUBTRACT that stays non-negative ---

assert("SUBTRACT within bounds",
    executeOperations(BigInt(100), [{ type: "SUBTRACT", operand: BigInt(30) }], BIG),
    BigInt(70)
);

// --- Zero handling ---

assert("SHIFT_LEFT zero",
    executeOperations(BigInt(0), [{ type: "SHIFT_LEFT" }]),
    BigInt(0)
);

assert("SHIFT_RIGHT zero",
    executeOperations(BigInt(0), [{ type: "SHIFT_RIGHT" }]),
    BigInt(0)
);

assert("REVERSE zero",
    executeOperations(BigInt(0), [{ type: "REVERSE" }]),
    BigInt(0)
);

// --- Single digit ---

assert("SHIFT_LEFT single digit",
    executeOperations(BigInt(5), [{ type: "SHIFT_LEFT" }]),
    BigInt(5)
);

assert("REVERSE single digit",
    executeOperations(BigInt(7), [{ type: "REVERSE" }]),
    BigInt(7)
);

// --- Leading zeros from digit ops ---

assert("REVERSE with leading zeros: 10000 → 00001 → 1",
    executeOperations(BigInt(10000), [{ type: "REVERSE" }]),
    BigInt(1)
);

assert("SHIFT_LEFT with trailing zeros: 12300 → 23001",
    executeOperations(BigInt(12300), [{ type: "SHIFT_LEFT" }]),
    BigInt(23001)
);

// --- Division truncation toward zero ---

assert("DIVIDE truncates toward zero: 7 / 2 = 3",
    executeOperations(BigInt(7), [{ type: "DIVIDE", operand: BigInt(2) }], BIG),
    BigInt(3)
);

assert("DIVIDE exact: 10 / 5 = 2",
    executeOperations(BigInt(10), [{ type: "DIVIDE", operand: BigInt(5) }], BIG),
    BigInt(2)
);

// --- Large numbers (with large maxResult) ---

assert("Large number multiply",
    executeOperations(BigInt("9999999999"), [{ type: "MULTIPLY", operand: BigInt("9999999999") }], BIG),
    BigInt("99999999980000000001")
);

assert("Large number reverse",
    executeOperations(BigInt("123456789"), [{ type: "REVERSE" }], BIG),
    BigInt("987654321")
);

// --- Mixed operations ---

assert("Chain: arithmetic + digit",
    executeOperations(BigInt(100), [
        { type: "MULTIPLY", operand: BigInt(3) },  // 300
        { type: "REVERSE" },                        // 003 → 3
        { type: "ADD", operand: BigInt(100) }       // 103
    ]),
    BigInt(103)
);

assert("Chain: digit + arithmetic",
    executeOperations(BigInt(12345), [
        { type: "SHIFT_LEFT" },                     // 23451
        { type: "ADD", operand: BigInt(549) }       // 24000
    ]),
    BigInt(24000)
);

// --- Bounds checking ---

assertThrows("Exceeds MAX_RESULT",
    () => executeOperations(BigInt(500000), [{ type: "MULTIPLY", operand: BigInt(3) }]),
    "RESULT_OUT_OF_BOUNDS"
);

assertThrows("Below MIN_RESULT (negative)",
    () => executeOperations(BigInt(10), [{ type: "SUBTRACT", operand: BigInt(20) }]),
    "RESULT_OUT_OF_BOUNDS"
);

// Custom maxResult
assert("Custom maxResult respected",
    executeOperations(BigInt(50), [{ type: "ADD", operand: BigInt(40) }], BigInt(100)),
    BigInt(90)
);

assertThrows("Custom maxResult exceeded",
    () => executeOperations(BigInt(50), [{ type: "ADD", operand: BigInt(60) }], BigInt(100)),
    "RESULT_OUT_OF_BOUNDS"
);

// Bounds checked at every step, not just final
assertThrows("Intermediate step exceeds bounds",
    () => executeOperations(BigInt(999999), [
        { type: "MULTIPLY", operand: BigInt(2) },  // 1999998 > 1_000_000
        { type: "DIVIDE", operand: BigInt(10) }     // would be 199999 but step 1 already failed
    ]),
    "RESULT_OUT_OF_BOUNDS"
);

// --- Validation errors ---

assertThrows("Division by zero",
    () => executeOperations(BigInt(10), [{ type: "DIVIDE", operand: BigInt(0) }]),
    "DIVISION_BY_ZERO"
);

assertThrows("Missing operand on arithmetic op",
    () => executeOperations(BigInt(10), [{ type: "ADD" } as Operation]),
    "MISSING_OPERAND"
);

assertThrows("Unexpected operand on digit op",
    () => executeOperations(BigInt(10), [{ type: "REVERSE", operand: BigInt(5) } as Operation]),
    "UNEXPECTED_OPERAND"
);

assertThrows("Unknown operation type",
    () => executeOperations(BigInt(10), [{ type: "EXPLODE" } as unknown as Operation]),
    "INVALID_OPERATION"
);

// --- Empty operations (identity) ---

assert("No operations returns initial",
    executeOperations(BigInt(42), []),
    BigInt(42)
);

// --- Results ---

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
process.exit(failed > 0 ? 1 : 0);
