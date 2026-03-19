import { createSeed, createRng, randomInt, pickOne, shuffle } from "./seededRng";
import { generateNumber, generateOperations, generatePuzzle, GeneratorConfig } from "./generator";
import { OperationType } from "./types";

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
    digitCount: 10,
    operationCount: 10,
    allowedOperations: ["MULTIPLY", "DIVIDE", "ADD", "SUBTRACT", "SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE"],
    operandRange: { min: 2, max: 50 }
};

// --- generateNumber ---
for (const dc of [1, 5, 10, 20]) {
    const rng = createRng(createSeed("t", `r-${dc}`));
    const num = generateNumber(rng, dc);
    const digits = num.toString();

    assertEq(`generateNumber ${dc} digits`, digits.length, dc);
    assert(`generateNumber no leading zero`, digits[0] !== "0");
}

// --- determinism ---
const rngN1 = createRng(createSeed("team-x", "round-y"));
const rngN2 = createRng(createSeed("team-x", "round-y"));
assertEq("generateNumber deterministic",
    generateNumber(rngN1, 10),
    generateNumber(rngN2, 10));

// --- operations ---
const rngOps = createRng(createSeed("t1", "r1"));
const ops = generateOperations(rngOps, defaultConfig);

assertEq("operations count", ops.length, 10);

// --- type validity ---
assert("valid operation types",
    ops.every(op => defaultConfig.allowedOperations.includes(op.type)));

// --- operand rules ---
const ARITHMETIC = new Set<OperationType>(["MULTIPLY", "DIVIDE", "ADD", "SUBTRACT"]);
const DIGIT = new Set<OperationType>(["SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE"]);

assert("arithmetic has operand",
    ops.filter(op => ARITHMETIC.has(op.type))
        .every(op => op.operand !== undefined));

assert("digit has no operand",
    ops.filter(op => DIGIT.has(op.type))
        .every(op => op.operand === undefined));

// --- division safety ---
const rngDiv = createRng(12345);
const divConfig: GeneratorConfig = {
    digitCount: 5,
    operationCount: 50,
    allowedOperations: ["DIVIDE"],
    operandRange: { min: 1, max: 100 }
};

const divOps = generateOperations(rngDiv, divConfig);

assert("division operand >= 2",
    divOps.every(op =>
        op.operand !== undefined &&
        op.operand >= BigInt(2)
    )
);

// --- multiply cap ---
const rngMul = createRng(67890);
const mulConfig: GeneratorConfig = {
    digitCount: 5,
    operationCount: 50,
    allowedOperations: ["MULTIPLY"],
    operandRange: { min: 2, max: 999 }
};

const mulOps = generateOperations(rngMul, mulConfig);

assert("multiply operand <= 20",
    mulOps.every(op =>
        op.operand !== undefined &&
        op.operand <= BigInt(20)
    )
);

// --- ADD/SUB range ---
const rngAdd = createRng(11111);
const addConfig: GeneratorConfig = {
    digitCount: 5,
    operationCount: 100,
    allowedOperations: ["ADD", "SUBTRACT"],
    operandRange: { min: 10, max: 30 }
};

const addOps = generateOperations(rngAdd, addConfig);

assert("ADD/SUB in range",
    addOps.every(op =>
        op.operand !== undefined &&
        op.operand >= BigInt(10) &&
        op.operand <= BigInt(30)
    )
);
// --- digit-only ---
const rngDigit = createRng(22222);
const digitConfig: GeneratorConfig = {
    digitCount: 5,
    operationCount: 20,
    allowedOperations: ["SHIFT_LEFT", "SHIFT_RIGHT", "REVERSE"],
    operandRange: { min: 2, max: 50 }
};

const digitOps = generateOperations(rngDigit, digitConfig);

assert("digit-only has no operands",
    digitOps.every(op => op.operand === undefined));

// --- full puzzle determinism ---
const puzzle1 = generatePuzzle("team-alpha", "round-3", defaultConfig);
const puzzle2 = generatePuzzle("team-alpha", "round-3", defaultConfig);

assertEq("same number", puzzle1.number, puzzle2.number);
assert("same operations",
    puzzle1.operations.every((op, i) =>
        op.type === puzzle2.operations[i].type &&
        op.operand === puzzle2.operations[i].operand
    ));

// --- different inputs ---
const puzzle3 = generatePuzzle("team-alpha", "round-4", defaultConfig);
assert("different round → different number", puzzle1.number !== puzzle3.number);

const puzzle4 = generatePuzzle("team-beta", "round-3", defaultConfig);
assert("different team → different number", puzzle1.number !== puzzle4.number);

// --- result ---
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);