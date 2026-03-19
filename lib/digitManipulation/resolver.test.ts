import { resolvePuzzle } from "./resolver";
import { getOrResolvePuzzle, getCachedPuzzle, setCachedPuzzle, clearPuzzleCache } from "./cache";
import { executeOperations } from "./engine";
import { GeneratorConfig } from "./generator";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
    if (condition) {
        passed++;
    } else {
        failed++;
        console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`);
    }
}

function assertEq<T>(label: string, actual: T, expected: T) {
    if (actual === expected) {
        passed++;
    } else {
        failed++;
        console.error(`  FAIL: ${label} — expected ${expected}, got ${actual}`);
    }
}

const config: GeneratorConfig = {
    digitCount: 8,
    operationCount: 5,
    allowedOperations: ["MULTIPLY", "DIVIDE", "ADD", "SUBTRACT", "SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE"],
    operandRange: { min: 2, max: 30 }
};

// ==============================
// resolver.ts tests
// ==============================

// --- determinism ---
const r1 = resolvePuzzle("team-1", "round-1", config);
const r2 = resolvePuzzle("team-1", "round-1", config);

assertEq("resolver deterministic number", r1.number, r2.number);
assertEq("resolver deterministic answer", r1.answer, r2.answer);
assertEq("resolver deterministic op count", r1.operations.length, r2.operations.length);
assert("resolver deterministic ops",
    r1.operations.every((op, i) =>
        op.type === r2.operations[i].type && op.operand === r2.operations[i].operand
    ));

// --- answer is correct ---
const recomputed = executeOperations(r1.number, r1.operations);
assertEq("resolver answer matches engine", r1.answer, recomputed);

// --- different inputs → different results ---
const r3 = resolvePuzzle("team-1", "round-2", config);
assert("different round → different number", r1.number !== r3.number);

const r4 = resolvePuzzle("team-2", "round-1", config);
assert("different team → different number", r1.number !== r4.number);

// --- different config → different result ---
const config2: GeneratorConfig = { ...config, digitCount: 6 };
const r5 = resolvePuzzle("team-1", "round-1", config2);
assert("different config → different number", r1.number !== r5.number);

// --- structure check ---
assertEq("operations count", r1.operations.length, config.operationCount);
assertEq("number digit count", r1.number.toString().length, config.digitCount);

// ==============================
// cache.ts tests
// ==============================

clearPuzzleCache();

// --- cache miss returns null ---
assertEq("cache miss", getCachedPuzzle("x", "y"), null);

// --- getOrResolvePuzzle populates cache ---
const c1 = getOrResolvePuzzle("team-c", "round-c", config);
const c2 = getCachedPuzzle("team-c", "round-c");
assert("cache populated after getOrResolve", c2 !== null);
assertEq("cached number matches", c2!.number, c1.number);
assertEq("cached answer matches", c2!.answer, c1.answer);

// --- cache hit returns same values ---
const c3 = getOrResolvePuzzle("team-c", "round-c", config);
assertEq("cache hit number", c3.number, c1.number);
assertEq("cache hit answer", c3.answer, c1.answer);

// --- cached result matches fresh resolve ---
const fresh = resolvePuzzle("team-c", "round-c", config);
assertEq("cache matches resolver number", c1.number, fresh.number);
assertEq("cache matches resolver answer", c1.answer, fresh.answer);

// --- setCachedPuzzle works ---
clearPuzzleCache();
const manual = resolvePuzzle("team-m", "round-m", config);
setCachedPuzzle("team-m", "round-m", manual);
const fetched = getCachedPuzzle("team-m", "round-m");
assert("manual set works", fetched !== null);
assertEq("manual set number", fetched!.number, manual.number);

// --- clearPuzzleCache works ---
clearPuzzleCache();
assertEq("cache cleared", getCachedPuzzle("team-m", "round-m"), null);
assertEq("cache cleared 2", getCachedPuzzle("team-c", "round-c"), null);

// --- expiry test (mock time) ---
clearPuzzleCache();
const originalNow = Date.now;

// Set cache entry
const e1 = resolvePuzzle("team-e", "round-e", config);
setCachedPuzzle("team-e", "round-e", e1);
assert("before expiry: cached", getCachedPuzzle("team-e", "round-e") !== null);

// Fast-forward time by 6 minutes
Date.now = () => originalNow() + 6 * 60 * 1000;
assertEq("after expiry: null", getCachedPuzzle("team-e", "round-e"), null);

// Restore
Date.now = originalNow;

// --- result ---
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
