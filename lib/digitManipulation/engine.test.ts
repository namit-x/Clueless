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
    executeOperations(BigInt(100), [{ type: "MULTIPLY", operand: BigInt(5) }]),
    BigInt(500)
);

assert("DIVIDE truncates",
    executeOperations(BigInt(10), [{ type: "DIVIDE", operand: BigInt(3) }]),
    BigInt(3)
);

assert("ADD",
    executeOperations(BigInt(100), [{ type: "ADD", operand: BigInt(50) }]),
    BigInt(150)
);

assert("SUBTRACT",
    executeOperations(BigInt(100), [{ type: "SUBTRACT", operand: BigInt(150) }]),
    BigInt(-50)
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

// --- Negative numbers ---

assert("REVERSE negative: -12345 → -54321",
    executeOperations(BigInt(-12345), [{ type: "REVERSE" }]),
    BigInt(-54321)
);

assert("SHIFT_LEFT negative: -12345 → -23451",
    executeOperations(BigInt(-12345), [{ type: "SHIFT_LEFT" }]),
    BigInt(-23451)
);

assert("SHIFT_RIGHT negative: -12345 → -51234",
    executeOperations(BigInt(-12345), [{ type: "SHIFT_RIGHT" }]),
    BigInt(-51234)
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

// --- Leading zeros ---

assert("REVERSE with leading zeros: 10000 → 00001 → 1",
    executeOperations(BigInt(10000), [{ type: "REVERSE" }]),
    BigInt(1)
);

assert("SHIFT_LEFT with trailing zeros: 12300 → 23001",
    executeOperations(BigInt(12300), [{ type: "SHIFT_LEFT" }]),
    BigInt(23001)
);

// --- Division truncation ---

assert("DIVIDE negative truncates toward zero: -10 / 3 = -3",
    executeOperations(BigInt(-10), [{ type: "DIVIDE", operand: BigInt(3) }]),
    BigInt(-3)
);

assert("DIVIDE negative by negative: -10 / -3 = 3",
    executeOperations(BigInt(-10), [{ type: "DIVIDE", operand: BigInt(-3) }]),
    BigInt(3)
);

// --- Large numbers ---

assert("Large number multiply",
    executeOperations(BigInt("9999999999"), [{ type: "MULTIPLY", operand: BigInt("9999999999") }]),
    BigInt("99999999980000000001")
);

assert("Large number reverse",
    executeOperations(BigInt("1234567890123456789"), [{ type: "REVERSE" }]),
    BigInt("9876543210987654321")
);

// --- Mixed operations ---

assert("Chain",
    executeOperations(BigInt(12345), [
        { type: "MULTIPLY", operand: BigInt(2) },
        { type: "REVERSE" },
        { type: "ADD", operand: BigInt(100) }
    ]),
    BigInt(9742)
);

// --- Results ---

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
process.exit(failed > 0 ? 1 : 0);