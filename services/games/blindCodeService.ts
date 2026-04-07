import {
    activateFirstRoundRepo,
    cleanupActiveRoundsRepo,
    completeGameResultRepo,
    failRoundRepo,
    getCurrentRoundRepo,
    getRoundAttemptStatusRepo,
    initializeTeamRoundProgressRepo,
    refundAttemptRepo,
    submitAndAdvanceRoundRepo,
    submitAndDecrementAttemptRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";
import { getRoundContextRepo } from "@/lib/repositories/roundsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";

/**
 * Initializes team round progress for the given game and activates the game in the repository.
 *
 * @returns The activation result object returned by the repository layer for the game
 */
export async function startBlindCodeGame(gameId: string) {

    await initializeTeamRoundProgressRepo(gameId);

    return await activateGameRepo(gameId);
}

function getBlindCodeChallenge(configuration: any) {

    if (typeof configuration?.expected_output !== "string" || configuration.expected_output.length === 0) {
        throw new Error("BLIND_CODE_CHALLENGE_NOT_FOUND");
    }

    return configuration.expected_output;
}

/**
 * Determine the expected answer used for judging a blind-code round.
 *
 * @param configuration - Challenge configuration object; may include `correct_answer` and `expected_output`
 * @returns The expected answer: `configuration.correct_answer` if it is a non-empty string, otherwise `configuration.expected_output`
 */
function getBlindCodeAnswer(configuration: any) {

    if (typeof configuration?.correct_answer === "string" && configuration.correct_answer.length > 0) {
        return configuration.correct_answer;
    }

    return getBlindCodeChallenge(configuration);
}

/**
 * Starts the blind-code flow for a team within a specific game and returns the initial round metadata and challenge.
 *
 * @param teamId - Identifier of the team starting the blind-code flow
 * @param gameId - Identifier of the game context to scope the first round activation
 * @returns An object containing `roundId` (the activated round's id), `round` (the round number), and `challenge` (the round's expected output)
 */
export async function startBlindCodeForTeam(teamId: string, gameId: string) {

    const roundId = await activateFirstRoundRepo(teamId, gameId);
    const { roundNumber, configuration } = await getRoundContextRepo(roundId);

    return {
        roundId,
        round: roundNumber,
        challenge: getBlindCodeChallenge(configuration)
    };
}

/**
 * Returns the current blind-code round status and challenge for a team within a game.
 *
 * @returns An object with either:
 * - `status: "COMPLETED"` and a `message` when no active round exists; or
 * - `status: "ACTIVE"`, `roundId`, `round` (round number), `challenge` (expected output string), and `attemptsLeft` (number of remaining attempts, 0–3).
 */
export async function getBlindCodeRound(teamId: string, gameId: string) {

    const roundProgress = await getCurrentRoundRepo(teamId, gameId);

    if (!roundProgress) {
        return {
            status: "COMPLETED",
            message: "No active round. Game may be completed or not yet started."
        };
    }

    const { roundId, roundNumber } = roundProgress;
    const { configuration } = await getRoundContextRepo(roundId);
    const { attemptCount } = await getRoundAttemptStatusRepo(teamId, roundId);

    return {
        status: "ACTIVE",
        roundId,
        round: roundNumber,
        challenge: getBlindCodeChallenge(configuration),
        attemptsLeft: Math.max(0, 3 - attemptCount)
    };
}

async function executeJudge0(sourceCode: string) {

    const response = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                language_id: 62, // Java
                source_code: sourceCode
            })
        }
    );

    return response.json();
}

/**
 * Judges a team's Java submission for a blind-code round, records the submission, updates round and game state, and returns the evaluation outcome.
 *
 * @param teamId - The team's identifier
 * @param roundId - The current round identifier
 * @param answer - The submitted Java source code to be judged
 * @param configuration - Round configuration used to determine the expected output
 * @param roundNumber - The current round number (1–3)
 * @param gameId - The game identifier
 * @returns An object describing whether the submission was correct, remaining attempts, and Judge0 output:
 *   - `correct`: `true` if the submission's trimmed stdout exactly matches the expected output, `false` otherwise.
 *   - `attemptsLeft`: Number of attempts remaining after this submission (0–3).
 *   - `data`: `{ output: string | null, error: string | null }` where `output` is Judge0 `stdout` or `null`, and `error` is `stderr` or `compile_output` or `null`.
 * @throws `MAX_ATTEMPTS_REACHED` when the team has no attempts available.
 * @throws `JUDGE_EXECUTION_FAILED_WITH_ATTEMPT_CONSUMED` if Judge0 execution fails and refunding the consumed attempt also fails.
 * @throws `ROUND_ALREADY_COMPLETED` if advancing the round after a correct submission fails because the round is no longer active.
 * @throws `ROUND_NOT_ACTIVE` if failing the round when attempts are exhausted fails because the round is no longer active.
 */
export async function submitBlindCodeAnswer(
    teamId: string,
    roundId: string,
    answer: string,          // this now contains Java code
    configuration: any,
    roundNumber: number,
    gameId: string
) {
    const attempt = await submitAndDecrementAttemptRepo(teamId, roundId, 3);
    if (!attempt) {
        throw new Error("MAX_ATTEMPTS_REACHED");
    }

    const expectedOutput = getBlindCodeAnswer(configuration).trim();

    let judgeResult: any;
    try {
        judgeResult = await executeJudge0(answer);
    } catch (error) {
        const refunded = await refundAttemptRepo(teamId, roundId, attempt.attemptCount);
        if (!refunded) {
            throw new Error("JUDGE_EXECUTION_FAILED_WITH_ATTEMPT_CONSUMED");
        }
        throw error;
    }

    const output = (judgeResult.stdout || "").trim();

    const isCorrect = output === expectedOutput;

    const evaluation =
        judgeResult.stdout ||
        judgeResult.stderr ||
        judgeResult.compile_output ||
        "NO_OUTPUT";

    if (isCorrect) {
        // Atomic: insert submission + complete round + activate next
        const { advanced } = await submitAndAdvanceRoundRepo(
            teamId, roundId, roundNumber, gameId,
            answer, true, evaluation
        );
        if (!advanced) throw new Error("ROUND_ALREADY_COMPLETED");

        if (roundNumber === 3) {
            await completeGameResultRepo(teamId, gameId, "COMPLETED");
            await cleanupActiveRoundsRepo(teamId);
        }

        return {
            correct: true,
            attemptsLeft: Math.max(0, 3 - attempt.attemptCount),
            data: {
                output: judgeResult.stdout ?? null,
                error: judgeResult.stderr ?? judgeResult.compile_output ?? null
            }
        };
    }

    await insertSubmissionRepo(teamId, roundId, answer, false, evaluation);

    const attemptsExhausted = attempt.attemptCount >= 3;

    if (attemptsExhausted) {
        const failed = await failRoundRepo(teamId, roundId);
        if (!failed) {
            throw new Error("ROUND_NOT_ACTIVE");
        }
        await completeGameResultRepo(teamId, gameId, "FAILED");
        await cleanupActiveRoundsRepo(teamId);
    }

    return {
        correct: false,
        attemptsLeft: Math.max(0, 3 - attempt.attemptCount),
        data: {
            output: judgeResult.stdout ?? null,
            error: judgeResult.stderr ?? judgeResult.compile_output ?? null
        }
    };
}
