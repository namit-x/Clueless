import {
    activateFirstRoundRepo,
    failAndAdvanceRoundRepo,
    getCurrentRoundRepo,
    getRoundAttemptStatusRepo,
    initializeTeamRoundProgressRepo,
    submitAndAdvanceRoundRepo,
    bulkSetMetadataRepo,
    getRoundMetadataRepo,
    getMetadataCoverageRepo,
    updateMetadataRevealedRepo,
    getRevealedNumbersRepo,
    areAllRoundsDoneRepo,
    submitAndDecrementAttemptRepo,
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";
import { getRoundContextRepo, getRoundsForGameRepo } from "@/lib/repositories/roundsRepo";
import { insertRewardWordRepo, getRewardWordRepo } from "@/lib/repositories/rewardWordsRepo";
import { getFinalSubmissionRepo, insertFinalSubmissionRepo, updateFinalSubmissionRepo } from "@/lib/repositories/finalSubmissionsRepo";
import { completeTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";

// ─── Constants ──────────────────────────────────────────────────────────────

const WORD_POOL = [
    "VENOM", "STARK", "NAMIT", "CRUISE", "BLADE",
    "FALCON", "BATMAN", "GHOST", "CYBORG", "CLUELESS"
];

// ─── Pure helpers ───────────────────────────────────────────────────────────

/**
 * Generates a shuffled sequence of ASCII codes where the letters of `word` are included as uppercase ASCII codes and remaining positions are filled with random lowercase ASCII codes.
 *
 * @param word - The reward word whose letters are encoded as uppercase ASCII codes
 * @param totalRounds - Desired length of the resulting sequence; must be greater than or equal to `word.length`
 * @returns A shuffled array of numeric ASCII codes of length `totalRounds`
 * @throws Error("WORD_TOO_LONG_FOR_ROUNDS") if `word.length` is greater than `totalRounds`
 */
function generateAsciiSequence(word: string, totalRounds: number): number[] {

    const realCodes = word.split("").map(ch => ch.charCodeAt(0));

    if (realCodes.length > totalRounds) {
        throw new Error("WORD_TOO_LONG_FOR_ROUNDS");
    }

    const noiseCodes: number[] = [];
    for (let i = 0; i < totalRounds - realCodes.length; i++) {
        noiseCodes.push(97 + Math.floor(Math.random() * 26));
    }

    const combined = [...realCodes, ...noiseCodes];

    for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined;
}

/**
 * Ensure per-round ASCII metadata exists for a team's game, initializing it from a reward word when missing.
 *
 * If no metadata exists for the game, this function derives an ASCII sequence from `fallbackWord` or the stored
 * reward word and writes `metadata.ascii_number` and `metadata.revealed = false` for each round. If metadata is
 * already fully present or partially present (some rounds have ASCII metadata), no changes are made.
 *
 * @param teamId - Team identifier used for metadata writes
 * @param gameId - Game identifier whose rounds will be inspected/updated
 * @param fallbackWord - Optional reward word to use instead of the persisted reward word
 * @returns The game's rounds array; unchanged if metadata was already present or partially present
 * @throws Error("REWARD_WORD_NOT_FOUND") if no reward word is available and no `fallbackWord` was provided
 * @throws Error("WORD_TOO_LONG_FOR_ROUNDS") if the reward word's length exceeds the number of rounds
 */
async function ensureQuizV2Metadata(teamId: string, gameId: string, fallbackWord?: string) {

    const rounds = await getRoundsForGameRepo(gameId);
    const coverage = await getMetadataCoverageRepo(teamId, gameId);

    if (coverage.total === 0 || coverage.withAscii === coverage.total) {
        return rounds;
    }

    // If some rounds already have ASCII numbers and some do not, we avoid rewriting
    // the sequence because that would corrupt the hidden word mapping.
    if (coverage.withAscii > 0) {
        return rounds;
    }

    const word = fallbackWord ?? await getRewardWordRepo(teamId, gameId);
    if (!word) {
        throw new Error("REWARD_WORD_NOT_FOUND");
    }

    const asciiSequence = generateAsciiSequence(word, rounds.length);
    const updates = rounds.map((round: any, i: number) => ({
        teamId,
        roundId: round.id,
        metadata: { ascii_number: asciiSequence[i], revealed: false },
    }));

    await bulkSetMetadataRepo(updates);
    return rounds;
}

/**
 * Initializes per-team round progress for the given game and activates the game.
 *
 * @param gameId - The identifier of the game to start
 * @returns The activation result for the specified game
 */

export async function startQuizV2Game(gameId: string) {

    await initializeTeamRoundProgressRepo(gameId);

    return await activateGameRepo(gameId);
}

/**
 * Starts Quiz V2 for a team and returns the first round's question payload.
 *
 * Activates the team's first round, ensures a reward word is recorded and per-round ASCII metadata exists, and returns the initial question data.
 *
 * @param teamId - The team's unique identifier
 * @param gameId - The game's unique identifier
 * @returns An object containing `roundId`, `round` (1), `question`, and `options` for the first round
 */

export async function startQuizV2ForTeam(teamId: string, gameId: string) {

    // 1. Activate round 1 (idempotent)
    const roundId = await activateFirstRoundRepo(teamId, gameId);
    const { configuration } = await getRoundContextRepo(roundId);

    // 2. Assign a random word (idempotent — ON CONFLICT returns existing)
    const randomWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    const word = await insertRewardWordRepo(teamId, gameId, randomWord);

    // 3. Ensure every round has per-team ASCII metadata.
    await ensureQuizV2Metadata(teamId, gameId, word);

    // 4. Return first question
    return {
        roundId,
        round: 1,
        question: configuration.question,
        options: configuration.options,
    };
}

/**
 * Retrieve the current Quiz V2 state for a team within a game.
 *
 * Ensures per-round ASCII metadata exists, then returns the team's active-round payload or a final/completion status.
 *
 * @param teamId - The team's unique identifier
 * @param gameId - The game's unique identifier
 * @returns An object with `status` set to one of:
 * - `"ACTIVE"`: includes `roundId`, `round` (number), `question`, `options`, `attemptsLeft`, and `revealedNumbers` (array of ASCII numbers).
 * - `"NOT_STARTED"`: includes `message` explaining no active round.
 * - `"COMPLETED"`: includes `message` and `revealedNumbers` (array of ASCII numbers) indicating all rounds finished and awaiting final submission.
 * - `"GAME_OVER"`: includes `message` indicating the game is finished (final submission evaluated or correct).
 */

export async function getQuizV2Round(teamId: string, gameId: string) {

    await ensureQuizV2Metadata(teamId, gameId);

    const roundProgress = await getCurrentRoundRepo(teamId, gameId);

    if (!roundProgress) {
        // No ACTIVE round — check if all rounds are done (final phase)
        const allDone = await areAllRoundsDoneRepo(teamId, gameId);

        if (allDone) {
            const finalSub = await getFinalSubmissionRepo(teamId);

            if (finalSub && (finalSub.is_correct || finalSub.evaluated_at)) {
                return {
                    status: "GAME_OVER",
                    message: "Game completed.",
                };
            }

            const revealed = await getRevealedNumbersRepo(teamId, gameId);

            return {
                status: "COMPLETED",
                message: "All rounds completed. Awaiting final submission.",
                revealedNumbers: revealed.map(r => r.asciiNumber),
            };
        }

        return {
            status: "NOT_STARTED",
            message: "Game not started or no active round.",
        };
    }

    const { roundId, roundNumber } = roundProgress;
    const { configuration } = await getRoundContextRepo(roundId);
    const { attemptCount } = await getRoundAttemptStatusRepo(teamId, roundId);
    const maxAttempts = configuration.max_attempts ?? 2;

    const revealed = await getRevealedNumbersRepo(teamId, gameId);

    return {
        status: "ACTIVE",
        roundId,
        round: roundNumber,
        question: configuration.question,
        options: configuration.options,
        attemptsLeft: maxAttempts - attemptCount,
        revealedNumbers: revealed.map(r => r.asciiNumber),
    };
}

/**
 * Processes a team's answer for a quiz round, updates attempts and round state, and returns the resulting status.
 *
 * @param teamId - The team's identifier
 * @param roundId - The active round's identifier
 * @param answer - The team's submitted answer
 * @param configuration - Round configuration object (must include `correct_answer` and may include `max_attempts`)
 * @param roundNumber - The numeric index of the round within the game
 * @param gameId - The game identifier
 * @returns An object describing the outcome:
 * - `{ status: "CORRECT", asciiNumber }` when the answer is correct.
 * - `{ status: "INCORRECT", attemptsUsed, attemptsLeft }` when incorrect and attempts remain.
 * - `{ status: "ROUND_FAILED", message }` when attempts are exhausted and the round advances.
 * - `{ status: "ALL_ROUNDS_COMPLETED", revealedNumbers[, asciiNumber] }` when the final round is completed; `asciiNumber` is included if the current submission revealed a number.
 * @throws `Error("MAX_ATTEMPTS_REACHED")` if no attempts are available before submitting.
 * @throws `Error("ROUND_ALREADY_COMPLETED")` if the round was already completed while trying to advance after a correct answer.
 * @throws `Error("ROUND_NOT_ACTIVE")` if the round could not be advanced after exhausting attempts.
 */

export async function submitQuizV2Answer(
    teamId: string,
    roundId: string,
    answer: string,
    configuration: any,
    roundNumber: number,
    gameId: string,
) {

    await ensureQuizV2Metadata(teamId, gameId);

    const maxAttempts = configuration.max_attempts ?? 2;

    const attempt = await submitAndDecrementAttemptRepo(teamId, roundId, maxAttempts);
    if (!attempt) {
        throw new Error("MAX_ATTEMPTS_REACHED");
    }

    const isCorrect =
        configuration.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase();

    if (isCorrect) {
        // Atomic: submit + complete + advance
        const { advanced } = await submitAndAdvanceRoundRepo(
            teamId, roundId, roundNumber, gameId,
            answer, true, "Quiz V2 — Correct"
        );

        if (!advanced) {
            throw new Error("ROUND_ALREADY_COMPLETED");
        }

        // Reveal ASCII number for this round
        await updateMetadataRevealedRepo(teamId, roundId);
        const metadata = await getRoundMetadataRepo(teamId, roundId);

        // Check if all rounds are now done
        const allDone = await areAllRoundsDoneRepo(teamId, gameId);

        if (allDone) {
            const revealed = await getRevealedNumbersRepo(teamId, gameId);
            return {
                status: "ALL_ROUNDS_COMPLETED",
                asciiNumber: metadata.ascii_number,
                revealedNumbers: revealed.map((r: any) => r.asciiNumber),
            };
        }

        return {
            status: "CORRECT",
            asciiNumber: metadata.ascii_number,
        };
    }

    await insertSubmissionRepo(teamId, roundId, answer, false, "Quiz V2 — Incorrect");

    if (attempt.attemptCount >= maxAttempts) {
        const advanced = await failAndAdvanceRoundRepo(teamId, roundId, roundNumber, gameId);
        if (!advanced) {
            throw new Error("ROUND_NOT_ACTIVE");
        }

        const allDone = await areAllRoundsDoneRepo(teamId, gameId);

        if (allDone) {
            const revealed = await getRevealedNumbersRepo(teamId, gameId);
            return {
                status: "ALL_ROUNDS_COMPLETED",
                revealedNumbers: revealed.map((r: any) => r.asciiNumber),
            };
        }

        return {
            status: "ROUND_FAILED",
            message: "Attempts exhausted. Moving to next round.",
        };
    }

    return {
        status: "INCORRECT",
        attemptsUsed: attempt.attemptCount,
        attemptsLeft: maxAttempts - attempt.attemptCount,
    };
}

// ─── Team: submit final answer ──────────────────────────────────────────────

export async function submitQuizV2FinalAnswer(
    teamId: string,
    gameId: string,
    answer: string,
) {

    // 1. Verify all rounds are done
    const allDone = await areAllRoundsDoneRepo(teamId, gameId);
    if (!allDone) {
        throw new Error("ROUNDS_NOT_COMPLETED");
    }

    // 2. Get the correct word
    const correctWord = await getRewardWordRepo(teamId, gameId);
    if (!correctWord) {
        throw new Error("REWARD_WORD_NOT_FOUND");
    }

    // 3. Check existing final submission
    const existing = await getFinalSubmissionRepo(teamId);

    if (existing) {
        // Already correct — no more attempts needed
        if (existing.is_correct) {
            return {
                status: "ALREADY_COMPLETED",
                message: "Correct answer already submitted.",
            };
        }

        // evaluated_at is set → both attempts used
        if (existing.evaluated_at) {
            return {
                status: "ATTEMPTS_EXHAUSTED",
                message: "All attempts used.",
                attemptsLeft: 0,
            };
        }

        // Second attempt (evaluated_at is NULL → first was wrong)
        const isCorrect = answer.trim().toLowerCase() === correctWord.toLowerCase();
        const updated = await updateFinalSubmissionRepo(teamId, answer, isCorrect);

        if (!updated) {
            return { status: "ATTEMPTS_EXHAUSTED", message: "All attempts used.", attemptsLeft: 0 };
        }

        // Last attempt regardless — complete game
        await completeTeamGameResult(teamId, gameId);

        return {
            status: isCorrect ? "CORRECT" : "INCORRECT",
            isCorrect,
            attemptsLeft: 0,
            gameCompleted: true,
        };
    }

    // 4. First attempt
    const isCorrect = answer.trim().toLowerCase() === correctWord.toLowerCase();
    await insertFinalSubmissionRepo(teamId, answer, isCorrect);

    if (isCorrect) {
        // Correct on first try — complete game immediately
        await completeTeamGameResult(teamId, gameId);

        return {
            status: "CORRECT",
            isCorrect: true,
            attemptsLeft: 0,
            gameCompleted: true,
        };
    }

    return {
        status: "INCORRECT",
        isCorrect: false,
        attemptsLeft: 1,
        gameCompleted: false,
    };
}
