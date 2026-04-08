import { createSeed, createRng, randomInt, pickOne, shuffle } from "./seededRng";
import { generateNumber, generatePuzzle, GeneratorConfig } from "./generator";
import { OperationType, ARITHMETIC_OPS, DIGIT_OPS, PipelineError } from "./types";
import { executeOperations, DEFAULT_MAX_RESULT } from "./engine";

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

// ==============================
// seededRng.ts tests
// ==============================

// --- createSeed: deterministic ---
const seed1a = createSeed("team-abc", "round-1");
const seed1b = createSeed("team-abc", "round-1");
assertEq("createSeed deterministic", seed1a, seed1b);

// --- createSeed: different inputs ---
const seed2 = createSeed("team-abc", "round-2");
assert("createSeed different inputs", seed1a !== seed2);

// --- createSeed: order matters ---
const seedFlipped = createSeed("round-1", "team-abc");
assert("createSeed order matters", seed1a !== seedFlipped);

// --- createRng: deterministic sequence ---
const rngA = createRng(42);
const rngB = createRng(42);
const seqA = Array.from({ length: 20 }, () => rngA());
const seqB = Array.from({ length: 20 }, () => rngB());
assert("createRng deterministic sequence",
    seqA.every((v, i) => v === seqB[i]));

// --- createRng: range [0,1) ---
const rngRange = createRng(99999);
const rangeVals = Array.from({ length: 1000 }, () => rngRange());
assert("createRng values in [0,1)",
    rangeVals.every(v => v >= 0 && v < 1));

// --- createRng: different seeds diverge ---
const rngC = createRng(1);
const rngD = createRng(2);
const seqC = Array.from({ length: 10 }, () => rngC());
const seqD = Array.from({ length: 10 }, () => rngD());
assert("createRng different seeds diverge",
    !seqC.every((v, i) => v === seqD[i]));

// --- randomInt: bounds ---
const rngInt = createRng(777);
const ints = Array.from({ length: 200 }, () => randomInt(rngInt, 5, 15));
assert("randomInt in range", ints.every(v => v >= 5 && v <= 15));
assert("randomInt hits min", ints.includes(5));
assert("randomInt hits max", ints.includes(15));

// --- pickOne ---
const rngPick = createRng(321);
const items = ["a", "b", "c"] as const;
type Item = typeof items[number];

const picks: Item[] = Array.from({ length: 100 }, () => pickOne(rngPick, items));

assert("pickOne always valid", picks.every(p => items.includes(p)));
assert("pickOne hits all items", items.every(i => picks.includes(i)));

// --- shuffle ---
const rngSh1 = createRng(555);
const rngSh2 = createRng(555);
const arr = [1, 2, 3, 4, 5, 6, 7, 8];
const sh1 = shuffle(rngSh1, arr);
const sh2 = shuffle(rngSh2, arr);

assert("shuffle deterministic", sh1.every((v, i) => v === sh2[i]));
assert("shuffle preserves elements",
    [...sh1].sort((a, b) => a - b).every((v, i) => v === arr[i]));

// ==============================
// generator.ts tests
// ==============================

const defaultConfig: GeneratorConfig = {
    digitCount: 4,
    operationCount: 5,
    allowedOperations: ["MULTIPLY", "DIVIDE", "ADD", "SUBTRACT", "SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE"],
    operandRange: { min: 2, max: 50 }
};

// --- generateNumber ---
for (const dc of [1, 5, 10, 20]) {
    const rng = createRng(createSeed("t", `r-${dc}`));
    const num = generateNumber(rng, dc);
    const digits = num.toString();

    assertEq(`generateNumber ${dc} digits`, digits.length, dc);
    assert(`generateNumber ${dc} no leading zero`, digits[0] !== "0");
}

// --- determinism ---
const rngN1 = createRng(createSeed("team-x", "round-y"));
const rngN2 = createRng(createSeed("team-x", "round-y"));
assertEq("generateNumber deterministic",
    generateNumber(rngN1, 10),
    generateNumber(rngN2, 10));

// --- full puzzle determinism ---
const puzzle1 = generatePuzzle("team-alpha", "round-3", defaultConfig);
const puzzle2 = generatePuzzle("team-alpha", "round-3", defaultConfig);

assertEq("same number", puzzle1.number, puzzle2.number);
assertEq("same operation count", puzzle1.operations.length, puzzle2.operations.length);
assert("same operations",
    puzzle1.operations.every((op, i) =>
        op.type === puzzle2.operations[i].type &&
        op.operand === puzzle2.operations[i].operand
    ));

// --- different inputs → different puzzles ---
const puzzle3 = generatePuzzle("team-alpha", "round-4", defaultConfig);
assert("different round → different number", puzzle1.number !== puzzle3.number);

const puzzle4 = generatePuzzle("team-beta", "round-3", defaultConfig);
assert("different team → different number", puzzle1.number !== puzzle4.number);

// --- operations have correct structure ---
assert("arithmetic ops have operand",
    puzzle1.operations
        .filter(op => ARITHMETIC_OPS.has(op.type))
        .every(op => op.operand !== undefined));

assert("digit ops have no operand",
    puzzle1.operations
        .filter(op => DIGIT_OPS.has(op.type))
        .every(op => op.operand === undefined));

// --- division safety ---
const divConfig: GeneratorConfig = {
    digitCount: 3,
    operationCount: 20,
    allowedOperations: ["DIVIDE"],
    operandRange: { min: 1, max: 100 }
};

const divPuzzle = generatePuzzle("team-div", "round-div", divConfig);
assert("division operand >= 2",
    divPuzzle.operations.every(op =>
        op.operand !== undefined &&
        op.operand >= BigInt(2)
    )
);

// --- multiply cap ---
const mulConfig: GeneratorConfig = {
    digitCount: 2,
    operationCount: 3,
    allowedOperations: ["MULTIPLY"],
    operandRange: { min: 2, max: 999 },
    maxResult: 1_000_000_000
};

const mulPuzzle = generatePuzzle("team-mul", "round-mul", mulConfig);
assert("multiply operand <= 20",
    mulPuzzle.operations.every(op =>
        op.operand !== undefined &&
        op.operand <= BigInt(20)
    )
);

// --- ADD/SUB range ---
const addConfig: GeneratorConfig = {
    digitCount: 3,
    operationCount: 20,
    allowedOperations: ["ADD", "SUBTRACT"],
    operandRange: { min: 10, max: 30 }
};

const addPuzzle = generatePuzzle("team-add", "round-add", addConfig);
assert("ADD/SUB in range",
    addPuzzle.operations.every(op =>
        op.operand !== undefined &&
        op.operand >= BigInt(10) &&
        op.operand <= BigInt(30)
    )
);

// --- digit-only config ---
const digitConfig: GeneratorConfig = {
    digitCount: 5,
    operationCount: 10,
    allowedOperations: ["SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE"],
    operandRange: { min: 2, max: 50 }
};

const digitPuzzle = generatePuzzle("team-dig", "round-dig", digitConfig);
assert("digit-only has no operands",
    digitPuzzle.operations.every(op => op.operand === undefined));
assertEq("digit-only correct op count", digitPuzzle.operations.length, 10);

// --- bounds enforcement: generated puzzles stay within bounds ---
{
    // With a small maxResult, the simulation loop should still find valid puzzles
    const boundedConfig: GeneratorConfig = {
        digitCount: 3,
        operationCount: 3,
        allowedOperations: ["ADD", "SUBTRACT"],
        operandRange: { min: 2, max: 10 },
        maxResult: 999
    };

    const bp = generatePuzzle("team-bound", "round-bound", boundedConfig);
    const answer = executeOperations(bp.number, bp.operations, BigInt(999));
    assert("bounded puzzle: answer >= 0", answer >= BigInt(0));
    assert("bounded puzzle: answer <= 999", answer <= BigInt(999));
}

// --- bounds enforcement: initial number checked ---
{
    // digitCount=4 produces numbers 1000-9999, but maxResult=500 means
    // the initial number itself exceeds bounds. Generator should still work
    // because digitCount=1 isn't forced — it retries until it finds a valid combo.
    // Actually with digitCount=4 minimum is 1000 > 500, so all attempts fail.
    const impossibleConfig: GeneratorConfig = {
        digitCount: 4,
        operationCount: 1,
        allowedOperations: ["ADD"],
        operandRange: { min: 2, max: 5 },
        maxResult: 500
    };

    assertThrows("impossible config throws GENERATION_FAILED",
        () => generatePuzzle("team-imp", "round-imp", impossibleConfig),
        "GENERATION_FAILED"
    );
}

// --- invalid operation type rejected ---
assertThrows("invalid operation type in config",
    () => generatePuzzle("t", "r", {
        ...defaultConfig,
        allowedOperations: ["EXPLODE" as OperationType]
    }),
    "INVALID_OPERATION"
);

// --- result ---
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
