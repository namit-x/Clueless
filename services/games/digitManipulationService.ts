import {
    activateFirstRoundRepo,
    failRoundRepo,
    getCurrentRoundRepo,
    getRoundAttemptStatusRepo,
    initializeTeamRoundProgressRepo,
    submitAndAdvanceRoundRepo,
    submitAndDecrementAttemptRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo, getGameByIdRepo } from "@/lib/repositories/gameRepo";
import { getRoundContextRepo } from "@/lib/repositories/roundsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";
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

/**
 * Parse and validate a generator configuration object.
 *
 * @param configuration - An arbitrary value expected to be an object containing `digitCount` (number >= 1) and an optional `maxResult` (number >= 1).
 * @returns A `GeneratorConfig` containing `digitCount`, optional `maxResult`, and placeholder values for `operationCount`, `allowedOperations`, and `operandRange`.
 * @throws Error("INVALID_CONFIGURATION") if `configuration` is not an object.
 * @throws Error("INVALID_CONFIGURATION: digitCount missing or < 1") if `digitCount` is not a number >= 1.
 * @throws Error("INVALID_CONFIGURATION: maxResult must be a positive number") if `maxResult` is present but not a number >= 1.
 */

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

/**
 * Validates a submitted answer string for digit-manipulation rounds.
 *
 * Ensures the value is non-empty (after trimming), does not exceed the configured maximum length,
 * and represents an integer (optional leading `-` followed by digits).
 *
 * @param answer - The raw submitted answer string to validate
 * @throws Error("INVALID_SUBMISSION: answer is empty") if the trimmed answer is empty
 * @throws Error("INVALID_SUBMISSION: answer exceeds maximum length") if the trimmed answer length is greater than the allowed maximum
 * @throws Error("INVALID_SUBMISSION: answer must be numeric") if the trimmed answer is not an integer literal (optional leading `-` and digits only)
 */
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

/**
 * Initialize per-team round progress for the given game and activate the digit manipulation game.
 *
 * @returns The activated game record returned by the activation repository
 */

export async function startDigitManipulationGame(gameId: string) {
    await initializeTeamRoundProgressRepo(gameId);
    return await activateGameRepo(gameId);
}

/**
 * Starts the first round for a team and returns the initial round context.
 *
 * @returns An object with the round context:
 * - `roundId`: The created round identifier.
 * - `roundNumber`: The sequential number of the round within the game.
 * - `number`: The puzzle's starting number as a string.
 * - `operations`: The puzzle operations serialized for transport.
 * - `attemptsLeft`: How many submission attempts remain for the team in this round.
 */
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

/**
 * Fetches the current active digit-manipulation round for a team in a game.
 *
 * @param teamId - The team's unique identifier
 * @param gameId - The game's unique identifier
 * @returns An object describing the current round. If no active round exists, returns `{ status: "NO_ACTIVE_ROUND", message: string }`. Otherwise returns `{ roundId: string, roundNumber: number, number: string, operations: { type: string; operand?: string }[], attemptsLeft: number }`.
 */

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

/**
 * Processes and records a submitted answer for a team's digit-manipulation round.
 *
 * Validates the submitted answer against configured bounds, consumes an attempt, checks the canonical puzzle answer, and updates round state (advance on correct, record submission and possibly fail round on exhaustion).
 *
 * @param teamId - Identifier of the submitting team
 * @param roundId - Identifier of the round receiving the submission
 * @param answer - Submitted answer string (will be trimmed and parsed as an integer)
 * @param configuration - Round configuration object; may include `maxResult` to bound valid answers
 * @param roundNumber - Expected round number for the submission (used when advancing the round)
 * @param gameId - Identifier of the game; must refer to an active game
 * @returns An object with `correct: true` when the submission matches the resolved puzzle answer (otherwise `correct: false`) and `attemptsLeft` indicating remaining attempts after this submission
 * @throws Error("INVALID_SUBMISSION: answer is empty") when `answer` is blank
 * @throws Error("INVALID_SUBMISSION: answer exceeds maximum length") when `answer` is too long
 * @throws Error("INVALID_SUBMISSION: answer must be numeric") when `answer` is not an integer string
 * @throws Error("INVALID_SUBMISSION: answer is out of bounds") when the parsed numeric value is outside allowed range
 * @throws Error("GAME_NOT_ACTIVE: game is not live") when the referenced game is not active
 * @throws Error("MAX_ATTEMPTS_REACHED") when no attempts remain for the round
 * @throws Error("ROUND_ALREADY_COMPLETED") when a correct submission cannot advance because the round is already completed
 * @throws Error("ROUND_NOT_ACTIVE") when attempting to mark a failed round that is no longer active
 */

export async function submitDigitManipulationAnswer(
    teamId: string,
    roundId: string,
    answer: string,
    configuration: unknown,
    roundNumber: number,
    gameId: string
) {
    // 1. Validate input
    validateSubmissionAnswer(answer);

    const submittedValue = BigInt(answer.trim());

    // 2. Minimal config (only what matters now)
    const config = parseConfiguration(configuration);
    const maxResult = config.maxResult !== undefined
        ? BigInt(config.maxResult)
        : DEFAULT_MAX_RESULT;

    // Optional early rejection (fast fail)
    if (submittedValue < MIN_RESULT || submittedValue > maxResult) {
        throw new Error("INVALID_SUBMISSION: answer is out of bounds");
    }

    // 3. Game must be active
    await assertGameActive(gameId);

    const attempt = await submitAndDecrementAttemptRepo(teamId, roundId, MAX_ATTEMPTS);
    if (!attempt) {
        throw new Error("MAX_ATTEMPTS_REACHED");
    }

    // 4. Compute correct answer (single source of truth)
    const { answer: correctAnswer } = resolvePuzzle(
        teamId,
        roundId,
        config
    );

    const isCorrect = submittedValue === correctAnswer;

    // 5. Atomic DB update
    if (isCorrect) {
        const { advanced } = await submitAndAdvanceRoundRepo(
            teamId,
            roundId,
            roundNumber,
            gameId,
            answer.trim(),
            true,
            "CORRECT"
        );

        if (!advanced) {
            throw new Error("ROUND_ALREADY_COMPLETED");
        }

        return { correct: true, attemptsLeft: computeAttemptsLeft(attempt.attemptCount) };
    }

    await insertSubmissionRepo(teamId, roundId, answer.trim(), false, "WRONG");

    if (attempt.attemptCount >= MAX_ATTEMPTS) {
        const failed = await failRoundRepo(teamId, roundId);
        if (!failed) {
            throw new Error("ROUND_NOT_ACTIVE");
        }
    }

    return {
        correct: false,
        attemptsLeft: computeAttemptsLeft(attempt.attemptCount)
    };
}
