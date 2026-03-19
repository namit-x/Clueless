import {
    activateFirstRoundRepo,
    activateNextRoundRepo,
    completeRoundRepo,
    decreaseAttemptRepo,
    getCurrentRoundRepo,
    getRoundAttemptStatusRepo,
    initializeTeamRoundProgressRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";
import { getRoundContextRepo } from "@/lib/repositories/roundsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";
import { getOrResolvePuzzle } from "@/lib/digitManipulation/cache";
import { GeneratorConfig } from "@/lib/digitManipulation/generator";
import { Operation } from "@/lib/digitManipulation/types";

const MAX_ATTEMPTS = 3;

// ─── Pure helpers (exported for testing) ───────────────────────────────────

export function parseConfiguration(configuration: unknown): GeneratorConfig {
    const c = configuration as Record<string, unknown>;

    if (!c || typeof c !== "object") throw new Error("INVALID_CONFIGURATION");

    const digitCount = c.digitCount;
    const operationCount = c.operationCount;
    const allowedOperations = c.allowedOperations;
    const operandRange = c.operandRange as Record<string, unknown> | undefined;

    if (typeof digitCount !== "number" || digitCount < 1)
        throw new Error("INVALID_CONFIGURATION: digitCount missing or < 1");
    if (typeof operationCount !== "number" || operationCount < 1)
        throw new Error("INVALID_CONFIGURATION: operationCount missing or < 1");
    if (!Array.isArray(allowedOperations) || allowedOperations.length === 0)
        throw new Error("INVALID_CONFIGURATION: allowedOperations missing or empty");
    if (!operandRange || typeof operandRange.min !== "number" || typeof operandRange.max !== "number")
        throw new Error("INVALID_CONFIGURATION: operandRange missing or invalid");

    return {
        digitCount,
        operationCount,
        allowedOperations,
        operandRange: { min: operandRange.min as number, max: operandRange.max as number }
    };
}

export function validateSubmissionAnswer(answer: string): void {
    if (!answer || answer.trim() === "") {
        throw new Error("INVALID_SUBMISSION: answer is empty");
    }
    if (!/^-?\d+$/.test(answer.trim())) {
        throw new Error("INVALID_SUBMISSION: answer must be numeric");
    }
}

export function computeAttemptsLeft(attemptCount: number): number {
    return Math.max(0, MAX_ATTEMPTS - attemptCount);
}

// ─── Game lifecycle ─────────────────────────────────────────────────────────

export async function startDigitManipulationGame(gameId: string) {
    await initializeTeamRoundProgressRepo(gameId);
    return activateGameRepo(gameId);
}

export async function startDigitManipulationForTeam(teamId: string) {
    const roundId = await activateFirstRoundRepo(teamId);
    const { roundNumber, configuration } = await getRoundContextRepo(roundId);
    const config = parseConfiguration(configuration);
    const { number, operations } = getOrResolvePuzzle(teamId, roundId, config);
    const { attemptCount } = await getRoundAttemptStatusRepo(teamId, roundId);

    return {
        roundId,
        roundNumber,
        number: number.toString(),
        operations: operations as Operation[],
        attemptsLeft: computeAttemptsLeft(attemptCount)
    };
}

// ─── Get current round ──────────────────────────────────────────────────────

export async function getDigitManipulationRound(teamId: string) {
    const { roundId, roundNumber } = await getCurrentRoundRepo(teamId);
    const { configuration } = await getRoundContextRepo(roundId);
    const config = parseConfiguration(configuration);
    const { number, operations } = getOrResolvePuzzle(teamId, roundId, config);
    const { attemptCount } = await getRoundAttemptStatusRepo(teamId, roundId);

    return {
        roundId,
        roundNumber,
        number: number.toString(),
        operations: operations as Operation[],
        attemptsLeft: computeAttemptsLeft(attemptCount)
    };
}

// ─── Submit answer ──────────────────────────────────────────────────────────

export async function submitDigitManipulationAnswer(
    teamId: string,
    roundId: string,
    answer: string,
    configuration: unknown,
    roundNumber: number
) {
    validateSubmissionAnswer(answer);

    const config = parseConfiguration(configuration);

    const { status, attemptCount } = await getRoundAttemptStatusRepo(teamId, roundId);

    if (status === "COMPLETED") {
        throw new Error("ROUND_ALREADY_COMPLETED");
    }
    if (status === "FAILED") {
        throw new Error("MAX_ATTEMPTS_REACHED");
    }
    if (attemptCount >= MAX_ATTEMPTS) {
        throw new Error("MAX_ATTEMPTS_REACHED");
    }

    const { answer: correctAnswer } = getOrResolvePuzzle(teamId, roundId, config);

    const isCorrect = BigInt(answer.trim()) === correctAnswer;

    await insertSubmissionRepo(
        teamId,
        roundId,
        answer.trim(),
        isCorrect,
        isCorrect ? "CORRECT" : `WRONG: expected ${correctAnswer}`
    );

    if (isCorrect) {
        await completeRoundRepo(teamId, roundId);
        await activateNextRoundRepo(teamId, roundNumber);
        return { correct: true, attemptsLeft: MAX_ATTEMPTS };
    }

    const newAttemptCount = await decreaseAttemptRepo(teamId, roundId);
    return { correct: false, attemptsLeft: computeAttemptsLeft(newAttemptCount) };
}
