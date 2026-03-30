import {
    activateFirstRoundRepo,
    getCurrentRoundRepo,
    getRoundAttemptStatusRepo,
    initializeTeamRoundProgressRepo,
    submitAndAdvanceRoundRepo,
    submitDecrementAndAdvanceRepo,
    bulkSetMetadataRepo,
    getRoundMetadataRepo,
    updateMetadataRevealedRepo,
    getRevealedNumbersRepo,
    areAllRoundsDoneRepo,
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo, getActiveGameRepo } from "@/lib/repositories/gameRepo";
import { getRoundContextRepo, getRoundsForGameRepo } from "@/lib/repositories/roundsRepo";
import { insertRewardWordRepo, getRewardWordRepo } from "@/lib/repositories/rewardWordsRepo";
import { getFinalSubmissionRepo, insertFinalSubmissionRepo, updateFinalSubmissionRepo } from "@/lib/repositories/finalSubmissionsRepo";
import { completeTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";

// ─── Constants ──────────────────────────────────────────────────────────────

const WORD_POOL = [
    "WEATHER", "NAMIT", "MAYANK", "HARMED", "ACTION",
    "SCHOOL", "BOTTLE", "BREAD", "KITCHEN", "CLUELESS"
];

const TOTAL_ROUNDS = 10;

// ─── Pure helpers ───────────────────────────────────────────────────────────

/**
 * Generate a shuffled array of 10 ASCII codes for a given word.
 * Uppercase ASCII codes for real letters, random lowercase (97-122) for noise.
 */
function generateAsciiSequence(word: string, totalRounds: number): number[] {

    const realCodes = word.split("").map(ch => ch.charCodeAt(0));

    const noiseCodes: number[] = [];
    for (let i = 0; i < totalRounds - realCodes.length; i++) {
        noiseCodes.push(97 + Math.floor(Math.random() * 26));
    }

    const combined = [...realCodes, ...noiseCodes];

    // Fisher-Yates shuffle
    for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined;
}

// ─── Admin: start game ──────────────────────────────────────────────────────

export async function startQuizV2Game(gameId: string) {

    await initializeTeamRoundProgressRepo(gameId);

    return await activateGameRepo(gameId);
}

// ─── Team: start game ───────────────────────────────────────────────────────

export async function startQuizV2ForTeam(teamId: string) {

    // 1. Activate round 1 (idempotent)
    const roundId = await activateFirstRoundRepo(teamId);
    const { configuration, gameId } = await getRoundContextRepo(roundId);

    // 2. Assign a random word (idempotent — ON CONFLICT returns existing)
    const randomWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    const word = await insertRewardWordRepo(teamId, gameId, randomWord);

    // 3. Generate ASCII sequence and store metadata (only if not already set)
    const existingMetadata = await getRoundMetadataRepo(teamId, roundId);

    if (!existingMetadata) {
        const rounds = await getRoundsForGameRepo(gameId);
        const asciiSequence = generateAsciiSequence(word, TOTAL_ROUNDS);

        const updates = rounds.map((round: any, i: number) => ({
            teamId,
            roundId: round.id,
            metadata: { ascii_number: asciiSequence[i], revealed: false },
        }));

        await bulkSetMetadataRepo(updates);
    }

    // 4. Return first question
    return {
        roundId,
        round: 1,
        question: configuration.question,
        options: configuration.options,
    };
}

// ─── Team: get current round ────────────────────────────────────────────────

export async function getQuizV2Round(teamId: string) {

    const roundProgress = await getCurrentRoundRepo(teamId);

    if (!roundProgress) {
        // No ACTIVE round — check if all rounds are done (final phase)
        const game = await getActiveGameRepo();
        const allDone = await areAllRoundsDoneRepo(teamId, game.id);

        if (allDone) {
            const finalSub = await getFinalSubmissionRepo(teamId);

            if (finalSub && (finalSub.is_correct || finalSub.evaluated_at)) {
                return {
                    status: "GAME_OVER",
                    message: "Game completed.",
                };
            }

            const revealed = await getRevealedNumbersRepo(teamId, game.id);

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
    const { configuration, gameId } = await getRoundContextRepo(roundId);
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

// ─── Team: submit round answer ──────────────────────────────────────────────

export async function submitQuizV2Answer(
    teamId: string,
    roundId: string,
    answer: string,
    configuration: any,
    roundNumber: number,
    gameId: string,
) {

    const maxAttempts = configuration.max_attempts ?? 2;

    // Pre-check: reject if round is not active or attempts exhausted
    const progress = await getRoundAttemptStatusRepo(teamId, roundId);
    if (progress.status !== "ACTIVE" || progress.attemptCount >= maxAttempts) {
        return {
            status: "FAILED",
            message: "No attempts remaining for this round.",
        };
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
            return { status: "FAILED", message: "Round already completed." };
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

    // Wrong answer — decrement and maybe advance (fail-and-advance)
    const result = await submitDecrementAndAdvanceRepo(
        teamId, roundId, answer, "Quiz V2 — Incorrect",
        maxAttempts, roundNumber, gameId
    );

    if (!result) {
        return { status: "FAILED", message: "No attempts remaining." };
    }

    if (result.failed) {
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
        attemptsUsed: result.attemptCount,
        attemptsLeft: maxAttempts - result.attemptCount,
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
