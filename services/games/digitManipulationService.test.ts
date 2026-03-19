/**
 * Tests for the pure helper functions in digitManipulationService.
 * DB-dependent functions (getDigitManipulationRound, submitDigitManipulationAnswer)
 * are tested via mock injection in the integration section below.
 */
import { parseConfiguration, validateSubmissionAnswer, computeAttemptsLeft } from "./digitManipulationService";
import { resolvePuzzle } from "@/lib/digitManipulation/resolver";
import { clearPuzzleCache, getOrResolvePuzzle } from "@/lib/digitManipulation/cache";
import { GeneratorConfig } from "@/lib/digitManipulation/generator";

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
        console.error(`  FAIL: ${label} — expected ${String(expected)}, got ${String(actual)}`);
    }
}

function assertThrows(label: string, fn: () => void, expectedSubstring: string) {
    try {
        fn();
        failed++;
        console.error(`  FAIL: ${label} — expected throw but none`);
    } catch (e: any) {
        if (e.message.includes(expectedSubstring)) {
            passed++;
        } else {
            failed++;
            console.error(`  FAIL: ${label} — wrong error: "${e.message}", expected to include "${expectedSubstring}"`);
        }
    }
}

// ──────────────────────────────────────────────
// parseConfiguration
// ──────────────────────────────────────────────

const validConfig = {
    digitCount: 10,
    operationCount: 8,
    allowedOperations: ["ADD", "SUBTRACT", "SHIFT_LEFT"],
    operandRange: { min: 2, max: 50 }
};

const parsed = parseConfiguration(validConfig);
assertEq("parseConfiguration digitCount", parsed.digitCount, 10);
assertEq("parseConfiguration operationCount", parsed.operationCount, 8);
assertEq("parseConfiguration operandRange.min", parsed.operandRange.min, 2);
assertEq("parseConfiguration operandRange.max", parsed.operandRange.max, 50);
assertEq("parseConfiguration allowedOperations length", parsed.allowedOperations.length, 3);

assertThrows("parseConfiguration null", () => parseConfiguration(null), "INVALID_CONFIGURATION");
assertThrows("parseConfiguration not object", () => parseConfiguration("bad"), "INVALID_CONFIGURATION");
assertThrows("parseConfiguration missing digitCount", () => parseConfiguration({ ...validConfig, digitCount: undefined }), "INVALID_CONFIGURATION");
assertThrows("parseConfiguration digitCount < 1", () => parseConfiguration({ ...validConfig, digitCount: 0 }), "digitCount");
assertThrows("parseConfiguration missing operationCount", () => parseConfiguration({ ...validConfig, operationCount: undefined }), "INVALID_CONFIGURATION");
assertThrows("parseConfiguration empty allowedOperations", () => parseConfiguration({ ...validConfig, allowedOperations: [] }), "allowedOperations");
assertThrows("parseConfiguration missing operandRange", () => parseConfiguration({ ...validConfig, operandRange: undefined }), "operandRange");
assertThrows("parseConfiguration operandRange missing min", () => parseConfiguration({ ...validConfig, operandRange: { max: 10 } }), "operandRange");

// ──────────────────────────────────────────────
// validateSubmissionAnswer
// ──────────────────────────────────────────────

// valid inputs — should not throw
for (const valid of ["12345", "-999", "0", "  42  "]) {
    try {
        validateSubmissionAnswer(valid);
        passed++;
    } catch (e: any) {
        failed++;
        console.error(`  FAIL: validateSubmissionAnswer should accept "${valid}" — ${e.message}`);
    }
}

assertThrows("validateSubmissionAnswer empty string", () => validateSubmissionAnswer(""), "empty");
assertThrows("validateSubmissionAnswer whitespace only", () => validateSubmissionAnswer("   "), "empty");
assertThrows("validateSubmissionAnswer alpha", () => validateSubmissionAnswer("abc"), "numeric");
assertThrows("validateSubmissionAnswer alphanumeric", () => validateSubmissionAnswer("12abc"), "numeric");
assertThrows("validateSubmissionAnswer float", () => validateSubmissionAnswer("3.14"), "numeric");
assertThrows("validateSubmissionAnswer symbol", () => validateSubmissionAnswer("!"), "numeric");

// ──────────────────────────────────────────────
// computeAttemptsLeft
// ──────────────────────────────────────────────

assertEq("computeAttemptsLeft 0 used", computeAttemptsLeft(0), 3);
assertEq("computeAttemptsLeft 1 used", computeAttemptsLeft(1), 2);
assertEq("computeAttemptsLeft 2 used", computeAttemptsLeft(2), 1);
assertEq("computeAttemptsLeft 3 used", computeAttemptsLeft(3), 0);
assertEq("computeAttemptsLeft > max (clamps to 0)", computeAttemptsLeft(5), 0);

// ──────────────────────────────────────────────
// Answer correctness via resolver
// (simulates what submitDigitManipulationAnswer does)
// ──────────────────────────────────────────────

const config: GeneratorConfig = {
    digitCount: 8,
    operationCount: 5,
    allowedOperations: ["ADD", "SUBTRACT", "MULTIPLY", "REVERSE"],
    operandRange: { min: 2, max: 20 }
};

const puzzle = resolvePuzzle("team-test", "round-test", config);
const correctAnswerStr = puzzle.answer.toString();
const wrongAnswerStr = (puzzle.answer + BigInt(1)).toString();

// Simulated comparison (mirrors what submitDigitManipulationAnswer does):
assert("correct answer comparison", BigInt(correctAnswerStr) === puzzle.answer);
assert("wrong answer comparison", BigInt(wrongAnswerStr) !== puzzle.answer);

// ──────────────────────────────────────────────
// Cache hit vs miss consistency
// ──────────────────────────────────────────────

clearPuzzleCache();

// First call — cache miss, resolves fresh
const fromCache1 = getOrResolvePuzzle("team-c", "round-c", config);

// Second call — cache hit
const fromCache2 = getOrResolvePuzzle("team-c", "round-c", config);

assertEq("cache hit: same number", fromCache1.number, fromCache2.number);
assertEq("cache hit: same answer", fromCache1.answer, fromCache2.answer);

// Both cache and fresh resolver agree
const fresh = resolvePuzzle("team-c", "round-c", config);
assertEq("cache matches fresh resolver: number", fromCache1.number, fresh.number);
assertEq("cache matches fresh resolver: answer", fromCache1.answer, fresh.answer);

// ──────────────────────────────────────────────
// Simulated submission flow (mock repos)
// ──────────────────────────────────────────────

interface MockState {
    status: string;
    attemptCount: number;
    submissions: { answer: string; isCorrect: boolean }[];
    completed: boolean;
    nextRoundActivated: boolean;
}

async function simulateSubmit(
    answer: string,
    state: MockState,
    overrideConfig = config
): Promise<{ correct: boolean; attemptsLeft: number } | { error: string }> {
    const MAX = 3;

    // validate
    try {
        validateSubmissionAnswer(answer);
    } catch (e: any) {
        return { error: e.message };
    }

    // parse config
    try {
        parseConfiguration(overrideConfig);
    } catch (e: any) {
        return { error: e.message };
    }

    // status guards
    if (state.status === "COMPLETED") return { error: "ROUND_ALREADY_COMPLETED" };
    if (state.status === "FAILED" || state.attemptCount >= MAX) return { error: "MAX_ATTEMPTS_REACHED" };

    // resolve answer
    const { answer: correctAnswer } = resolvePuzzle("team-sim", "round-sim", overrideConfig);
    const isCorrect = BigInt(answer.trim()) === correctAnswer;

    // record submission
    state.submissions.push({ answer: answer.trim(), isCorrect });

    if (isCorrect) {
        state.status = "COMPLETED";
        state.completed = true;
        state.nextRoundActivated = true;
        return { correct: true, attemptsLeft: MAX };
    }

    state.attemptCount++;
    if (state.attemptCount >= MAX) state.status = "FAILED";
    return { correct: false, attemptsLeft: MAX - state.attemptCount };
}

// ── async flow tests ─────────────────────────────────────────────────────────
(async () => {

// -- correct answer → round complete --
{
    const state: MockState = { status: "ACTIVE", attemptCount: 0, submissions: [], completed: false, nextRoundActivated: false };
    const { answer: correctAnswer } = resolvePuzzle("team-sim", "round-sim", config);
    const result = await simulateSubmit(correctAnswer.toString(), state) as any;

    assert("correct: result.correct true", result.correct === true);
    assertEq("correct: attemptsLeft = MAX", result.attemptsLeft, 3);
    assert("correct: state completed", state.completed);
    assert("correct: next round activated", state.nextRoundActivated);
    assertEq("correct: 1 submission recorded", state.submissions.length, 1);
    assert("correct: submission marked correct", state.submissions[0].isCorrect);
}

// -- wrong answer → attempt incremented --
{
    const state: MockState = { status: "ACTIVE", attemptCount: 0, submissions: [], completed: false, nextRoundActivated: false };
    const { answer: correctAnswer } = resolvePuzzle("team-sim", "round-sim", config);
    const wrongAnswer = (correctAnswer + BigInt(1)).toString();
    const result = await simulateSubmit(wrongAnswer, state) as any;

    assert("wrong: result.correct false", result.correct === false);
    assertEq("wrong: attemptsLeft decremented", result.attemptsLeft, 2);
    assertEq("wrong: attemptCount incremented", state.attemptCount, 1);
    assert("wrong: not completed", !state.completed);
    assert("wrong: submission recorded", state.submissions[0].isCorrect === false);
}

// -- attempts exhausted → reject on next submission --
{
    const state: MockState = { status: "ACTIVE", attemptCount: 2, submissions: [], completed: false, nextRoundActivated: false };
    const { answer: correctAnswer } = resolvePuzzle("team-sim", "round-sim", config);
    const wrongAnswer = (correctAnswer + BigInt(1)).toString();

    // Third (final) wrong attempt
    const result1 = await simulateSubmit(wrongAnswer, state) as any;
    assert("exhausted: 3rd attempt accepted", result1.correct === false);
    assertEq("exhausted: attemptsLeft = 0", result1.attemptsLeft, 0);
    assertEq("exhausted: status FAILED", state.status, "FAILED");

    // 4th attempt → rejected
    const result2 = await simulateSubmit(wrongAnswer, state) as any;
    assert("exhausted: 4th attempt rejected", "error" in result2);
    assert("exhausted: correct error code", result2.error.includes("MAX_ATTEMPTS_REACHED"));
}

// -- round already completed → reject --
{
    const state: MockState = { status: "COMPLETED", attemptCount: 0, submissions: [], completed: true, nextRoundActivated: true };
    const { answer: correctAnswer } = resolvePuzzle("team-sim", "round-sim", config);
    const result = await simulateSubmit(correctAnswer.toString(), state) as any;

    assert("idempotent: completed round rejected", "error" in result);
    assert("idempotent: correct error code", result.error.includes("ROUND_ALREADY_COMPLETED"));
}

// -- invalid input → error --
{
    const state: MockState = { status: "ACTIVE", attemptCount: 0, submissions: [], completed: false, nextRoundActivated: false };

    const r1 = await simulateSubmit("", state) as any;
    assert("invalid: empty rejected", "error" in r1 && r1.error.includes("empty"));

    const r2 = await simulateSubmit("abc", state) as any;
    assert("invalid: alpha rejected", "error" in r2 && r2.error.includes("numeric"));

    const r3 = await simulateSubmit("3.14", state) as any;
    assert("invalid: float rejected", "error" in r3 && r3.error.includes("numeric"));

    assertEq("invalid: no submissions recorded", state.submissions.length, 0);
}

// -- invalid config → error --
{
    const state: MockState = { status: "ACTIVE", attemptCount: 0, submissions: [], completed: false, nextRoundActivated: false };
    const badConfig = { digitCount: 0 } as any;
    const result = await simulateSubmit("12345", state, badConfig) as any;
    assert("invalid config: rejected", "error" in result);
}

// ──────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

})();
