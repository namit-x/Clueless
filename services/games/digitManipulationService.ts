import {
    activateFirstRoundRepo,
    getCurrentRoundRepo,
    getRoundAttemptStatusRepo,
    initializeTeamRoundProgressRepo,
    submitAndAdvanceRoundRepo,
    submitAndDecrementAttemptRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo, getGameByIdRepo } from "@/lib/repositories/gameRepo";
import { getRoundContextRepo } from "@/lib/repositories/roundsRepo";
import { getOrResolvePuzzle } from "@/lib/digitManipulation/cache";
import { resolvePuzzle } from "@/lib/digitManipulation/resolver";
import { MIN_RESULT, DEFAULT_MAX_RESULT } from "@/lib/digitManipulation/engine";
import { GeneratorConfig } from "@/lib/digitManipulation/generator";
import { Operation } from "@/lib/digitManipulation/types";

const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MS = 2000; // 1 submission per 2 seconds per team

// ─── Rate limiter (in-memory, per-team) ────────────────────────────────────

const lastSubmissionTime = new Map<string, number>();

export function checkRateLimit(teamId: string): void {
    const now = Date.now();
    const lastTime = lastSubmissionTime.get(teamId);

    if (lastTime && now - lastTime < RATE_LIMIT_MS) {
        throw new Error("RATE_LIMITED: too many submissions, wait a few seconds");
    }

    lastSubmissionTime.set(teamId, now);
}

// Cleanup stale entries every 60 seconds
setInterval(() => {
    const cutoff = Date.now() - RATE_LIMIT_MS * 2;
    for (const [key, time] of lastSubmissionTime.entries()) {
        if (time < cutoff) lastSubmissionTime.delete(key);
    }
}, 60000);

// ─── Pure helpers (exported for testing) ───────────────────────────────────

export function parseConfiguration(configuration: unknown): GeneratorConfig {
    const c = configuration as Record<string, unknown>;

    if (!c || typeof c !== "object") throw new Error("INVALID_CONFIGURATION");

    const digitCount = c.digitCount;
    const maxResult = c.maxResult;

    if (typeof digitCount !== "number" || digitCount < 1)
        throw new Error("INVALID_CONFIGURATION: digitCount missing or < 1");

    if (maxResult !== undefined && (typeof maxResult !== "number" || maxResult < 1))
        throw new Error("INVALID_CONFIGURATION: maxResult must be a positive number");

    return {
        digitCount,
        operationCount: 1,            // dummy (not used anymore)
        allowedOperations: [],        // dummy
        operandRange: { min: 0, max: 0 }, // dummy
        ...(maxResult !== undefined && { maxResult: maxResult as number })
    };
}

/** Maximum length of a submitted answer string. No valid result exceeds this. */
const MAX_ANSWER_LENGTH = 20;

export function validateSubmissionAnswer(answer: string): void {
    if (!answer || answer.trim() === "") {
        throw new Error("INVALID_SUBMISSION: answer is empty");
    }
    if (answer.trim().length > MAX_ANSWER_LENGTH) {
        throw new Error("INVALID_SUBMISSION: answer exceeds maximum length");
    }
    if (!/^-?\d+$/.test(answer.trim())) {
        throw new Error("INVALID_SUBMISSION: answer must be numeric");
    }
}

export function computeAttemptsLeft(attemptCount: number): number {
    return Math.max(0, MAX_ATTEMPTS - attemptCount);
}

// ─── Serialization ───────────────────────────────────────────────────────────

function serializeOperations(operations: Operation[]) {
    return operations.map(op => ({
        type: op.type,
        ...(op.operand !== undefined && { operand: op.operand.toString() })
    }));
}

// ─── Game state guard ──────────────────────────────────────────────────────

async function assertGameActive(gameId: string): Promise<void> {
    const game = await getGameByIdRepo(gameId);
    if (!game.is_active) {
        throw new Error("GAME_NOT_ACTIVE: game is not live");
    }
}

// ─── Game lifecycle ─────────────────────────────────────────────────────────

export async function startDigitManipulationGame(gameId: string) {
    await initializeTeamRoundProgressRepo(gameId);
    return await activateGameRepo(gameId);
}

export async function startDigitManipulationForTeam(teamId: string, gameId: string) {
    const roundId = await activateFirstRoundRepo(teamId, gameId);
    const { roundNumber, configuration } = await getRoundContextRepo(roundId);

    await assertGameActive(gameId);

    const config = parseConfiguration(configuration);
    const { number, operations } = getOrResolvePuzzle(teamId, roundId, config);
    const { attemptCount } = await getRoundAttemptStatusRepo(teamId, roundId);

    return {
        roundId,
        roundNumber,
        number: number.toString(),
        operations: serializeOperations(operations),
        attemptsLeft: computeAttemptsLeft(attemptCount)
    };
}

// ─── Get current round ──────────────────────────────────────────────────────

export async function getDigitManipulationRound(teamId: string, gameId: string) {
    const roundProgress = await getCurrentRoundRepo(teamId, gameId);

    if (!roundProgress) {
        return { status: "NO_ACTIVE_ROUND", message: "No active round found." };
    }

    const { roundId, roundNumber } = roundProgress;
    const { configuration } = await getRoundContextRepo(roundId);

    await assertGameActive(gameId);

    const config = parseConfiguration(configuration);
    const { number, operations } = getOrResolvePuzzle(teamId, roundId, config);
    const { attemptCount } = await getRoundAttemptStatusRepo(teamId, roundId);

    return {
        roundId,
        roundNumber,
        number: number.toString(),
        operations: serializeOperations(operations),
        attemptsLeft: computeAttemptsLeft(attemptCount)
    };
}

// ─── Submit answer ──────────────────────────────────────────────────────────

export async function submitDigitManipulationAnswer(
    teamId: string,
    roundId: string,
    answer: string,
    configuration: unknown,
    roundNumber: number,
    gameId: string
) {
    // 1. Input validation
    validateSubmissionAnswer(answer);

    // 2. Config validation
    const config = parseConfiguration(configuration);

    // 3. Early bounds rejection (uses engine constants, no separate logic)
    const maxResult = config.maxResult !== undefined
        ? BigInt(config.maxResult)
        : DEFAULT_MAX_RESULT;
    const submittedValue = BigInt(answer.trim());

    if (submittedValue < MIN_RESULT || submittedValue > maxResult) {
        throw new Error("INVALID_SUBMISSION: answer is out of bounds");
    }

    // 4. Game state guard
    await assertGameActive(gameId);

    // 5. Round state guard (DB is source of truth)
    const { status, attemptCount } = await getRoundAttemptStatusRepo(teamId, roundId);

    if (status === "LOCKED") {
        throw new Error("ROUND_LOCKED: round is not active");
    }
    if (status === "COMPLETED") {
        // Idempotent: round already completed — return existing result
        return { correct: true, attemptsLeft: MAX_ATTEMPTS };
    }
    if (status === "FAILED" || attemptCount >= MAX_ATTEMPTS) {
        throw new Error("MAX_ATTEMPTS_REACHED");
    }
    if (status !== "ACTIVE") {
        throw new Error("ROUND_NOT_ACTIVE: unexpected status " + status);
    }

    // 6. Recompute correct answer from resolver (never trust cache for verification)
    const { answer: correctAnswer } = resolvePuzzle(teamId, roundId, config);

    const isCorrect = submittedValue === correctAnswer;
    const evaluation = isCorrect ? "CORRECT" : `WRONG: expected ${correctAnswer}`;

    // 7+8. Atomic: record submission + state transition in one transaction
    if (isCorrect) {
        const { advanced } = await submitAndAdvanceRoundRepo(
            teamId, roundId, roundNumber, gameId,
            answer.trim(), true, evaluation
        );

        if (!advanced) {
            // Idempotent: concurrent request already completed this round
            console.log(`[DIGIT] Team ${teamId} round ${roundNumber}: concurrent completion (no-op)`);
            return { correct: true, attemptsLeft: MAX_ATTEMPTS };
        }

        console.log(`[DIGIT] Team ${teamId} completed round ${roundNumber} ✓`);
        return { correct: true, attemptsLeft: MAX_ATTEMPTS };
    }

    // Wrong answer — atomic: insert submission + decrement attempts
    const result = await submitAndDecrementAttemptRepo(
        teamId, roundId, answer.trim(), evaluation
    );

    if (!result) {
        throw new Error("MAX_ATTEMPTS_REACHED");
    }

    const attemptsLeft = computeAttemptsLeft(result.attemptCount);

    if (attemptsLeft === 0) {
        console.log(`[DIGIT] Team ${teamId} exhausted attempts on round ${roundNumber} ✗`);
    } else {
        console.log(`[DIGIT] Team ${teamId} wrong answer on round ${roundNumber} (${attemptsLeft} left)`);
    }

    return { correct: false, attemptsLeft };
}
