import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo, getTeamRouteRepo, insertTeamRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import {
    activateFirstRoundRepo,
    failRoundRepo,
    getActiveOrFailedRoundRepo,
    initializeTeamRoundProgressRepo,
    submitAndAdvanceRoundRepo,
    submitAndDecrementAttemptRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";
import { getClueAndAnswerForRoundRepo, getClueForRoundRepo, getRoundClueRepo } from "@/lib/repositories/routeLocationsRepo";
import { completeTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";

/**
 * Starts a treasure hunt game by assigning each approved team a unique route, initializing round progress, and activating the game.
 *
 * @param gameId - The identifier of the game to start
 * @returns The activation result returned by the game activation repository
 * @throws Error("INSUFFICIENT_ROUTES") - If there are fewer routes available than approved teams
 */
export async function startTreasureHuntGame(gameId: string) {

    // Parallelize independent fetches: teams and routes can be fetched simultaneously
    const [teams, routes] = await Promise.all([
        getApprovedTeamsRepo(),
        getAllRoutesRepo()
    ]);

    if (routes.length < teams.length) {
        throw new Error("INSUFFICIENT_ROUTES");
    }

    const mappings = teams.map((team: any, i: number) => ({
        team_id: team.team_id,
        route_id: routes[i].id
    }));

    // Parallelize route insertion and round progress initialization
    await Promise.all([
        insertTeamRoutesRepo(mappings),
        initializeTeamRoundProgressRepo(gameId)
    ]);

    return await activateGameRepo(gameId);
}

/**
 * Starts a team's treasure hunt by activating their first round and returning the first clue.
 *
 * @param teamId - The identifier of the team to start
 * @param gameId - The identifier of the game instance
 * @returns An object with `round` set to 1 and `clue` containing the round 1 clue for the team's assigned route
 */
export async function startTreasureHuntForTeam(teamId: string, gameId: string) {

    console.log(`[TreasureHuntService] Starting Treasure Hunt for team ${teamId}`);

    const [routeId] = await Promise.all([
        getTeamRouteRepo(teamId),
        activateFirstRoundRepo(teamId, gameId)
    ]);

    const clue = await getRoundClueRepo(routeId, 1);

    return {
        round: 1,
        clue
    };
}

/**
 * Retrieve the current treasure hunt round state for a team within a game.
 *
 * @param teamId - The identifier of the team
 * @param gameId - The identifier of the game
 * @returns An object describing the team's round state:
 * - If no active round exists: `{ status: "COMPLETED", message: string }`
 * - If the active round has been failed: `{ status: "FAILED", message: string }`
 * - If there is an active round: `{ status: "ACTIVE", roundId: string, round: number, clue: string, attemptsLeft: number }`
 */
export async function getTreasureHuntRound(teamId: string, gameId: string) {

    const [routeId, roundProgress] = await Promise.all([
        getTeamRouteRepo(teamId),
        getActiveOrFailedRoundRepo(teamId, gameId)
    ]);

    if (!roundProgress) {
        return {
            status: "COMPLETED",
            message: "No active round. Game may be completed or not yet started."
        };
    }

    if (roundProgress.status === 'FAILED') {
        return {
            status: "FAILED",
            message: "No active round. Attempts exhausted."
        };
    }

    const clue = await getClueForRoundRepo(routeId, roundProgress.roundNumber);

    return {
        status: "ACTIVE",
        roundId: roundProgress.roundId,
        round: roundProgress.roundNumber,
        clue,
        attemptsLeft: 3 - roundProgress.attemptCount
    };
}

/**
 * Processes a team's answer for a treasure-hunt round, updates attempts and round state, and returns the resulting outcome.
 *
 * @param teamId - ID of the team submitting the answer
 * @param roundId - ID of the active round attempt record
 * @param answer - Submitted answer text
 * @param roundNumber - Current round number being answered
 * @param gameId - ID of the game instance containing the round
 * @returns An object describing the outcome:
 * - `{ status: "COMPLETED" }` when the final round is correctly answered and the team completes the game.
 * - `{ status: "CORRECT" }` when the answer is correct and the team advances to the next round.
 * - `{ status: "INCORRECT", attemptsUsed, attemptsLeft }` when the answer is incorrect but attempts remain.
 * - `{ status: "FAILED", reason: "MAX_ATTEMPTS_EXHAUSTED", attemptsUsed: 3, attemptsLeft: 0, message }` when the team exhausts all attempts for the round.
 *
 * Errors thrown by the function:
 * - `Error("MAX_ATTEMPTS_REACHED")` if the team has no attempts available before submission.
 * - `Error("ROUND_ALREADY_COMPLETED")` if a correct submission could not advance because the round was already finalized.
 * - `Error("ROUND_NOT_ACTIVE")` if attempting to mark the round failed when attempts were exhausted.
 */
export async function submitTreasureHuntAnswer(
    teamId: string,
    roundId: string,
    answer: string,
    roundNumber: number,
    gameId: string
) {

    const FAILED_RESPONSE = {
        status: "FAILED",
        reason: "MAX_ATTEMPTS_EXHAUSTED",
        attemptsUsed: 3,
        attemptsLeft: 0,
        message: "You have used all attempts for this round"
    };

    const attempt = await submitAndDecrementAttemptRepo(teamId, roundId, 3);
    if (!attempt) {
        throw new Error("MAX_ATTEMPTS_REACHED");
    }

    const routeId = await getTeamRouteRepo(teamId);
    const { correctAnswer } = await getClueAndAnswerForRoundRepo(routeId, roundNumber);

    const isCorrect = correctAnswer.toLowerCase() === answer.trim().toLowerCase();

    if (isCorrect) {
        // Atomic: insert submission + complete round + activate next — all in one transaction
        const { advanced } = await submitAndAdvanceRoundRepo(
            teamId, roundId, roundNumber, gameId,
            answer, true, "Treasure Hunt"
        );

        if (!advanced) {
            throw new Error("ROUND_ALREADY_COMPLETED");
        }

        if (roundNumber === 3) {
            await completeTeamGameResult(teamId, gameId);
            return { status: "COMPLETED" };
        }

        return { status: "CORRECT" };
    }

    await insertSubmissionRepo(teamId, roundId, answer, false, "Treasure Hunt");

    if (attempt.attemptCount >= 3) {
        const failed = await failRoundRepo(teamId, roundId);
        if (!failed) {
            throw new Error("ROUND_NOT_ACTIVE");
        }
        return FAILED_RESPONSE;
    }

    return {
        status: "INCORRECT",
        attemptsUsed: attempt.attemptCount,
        attemptsLeft: 3 - attempt.attemptCount
    };
}
