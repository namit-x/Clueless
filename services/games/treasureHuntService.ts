import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo, getTeamRouteRepo, insertTeamRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import {
    activateFirstRoundRepo,
    completeAndAdvanceRoundRepo,
    decreaseAttemptRepo,
    getActiveOrFailedRoundRepo,
    getRoundAttemptStatusRepo,
    initializeTeamRoundProgressRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";
import { getClueAndAnswerForRoundRepo, getClueForRoundRepo, getRoundClueRepo } from "@/lib/repositories/routeLocationsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";
import { completeTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";

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

export async function startTreasureHuntForTeam(teamId: string) {

    console.log(`[TreasureHuntService] Starting Treasure Hunt for team ${teamId}`);

    const [routeId] = await Promise.all([
        getTeamRouteRepo(teamId),
        activateFirstRoundRepo(teamId)
    ]);

    const clue = await getRoundClueRepo(routeId, 1);

    return {
        round: 1,
        clue
    };
}

export async function getTreasureHuntRound(teamId: string) {

    const [routeId, roundProgress] = await Promise.all([
        getTeamRouteRepo(teamId),
        getActiveOrFailedRoundRepo(teamId)
    ]);

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

    // Pre-check: reject immediately if round is already failed or attempts exhausted.
    // This runs before answer evaluation and any DB writes.
    const progress = await getRoundAttemptStatusRepo(teamId, roundId);
    if (progress.status !== 'ACTIVE' || progress.attemptCount >= 3) {
        return FAILED_RESPONSE;
    }

    const routeId = await getTeamRouteRepo(teamId);
    const { correctAnswer } = await getClueAndAnswerForRoundRepo(routeId, roundNumber);

    const isCorrect = correctAnswer.toLowerCase() === answer.trim().toLowerCase();

    await insertSubmissionRepo(teamId, roundId, answer, isCorrect, "Treasure Hunt");

    if (isCorrect) {

        // completeAndAdvanceRoundRepo guards AND status = 'ACTIVE'.
        // If a concurrent wrong answer set status to FAILED between our pre-check
        // and here, advanced will be false — reject rather than silently advancing.
        const advanced = await completeAndAdvanceRoundRepo(teamId, roundId, roundNumber, gameId);

        if (!advanced) {
            return FAILED_RESPONSE;
        }

        if (roundNumber === 3) {
            await completeTeamGameResult(teamId, gameId);
            return { status: "COMPLETED" };
        }

        return { status: "CORRECT" };
    }

    let attemptCount: number;
    try {
        attemptCount = await decreaseAttemptRepo(teamId, roundId);
    } catch (e: any) {
        // Race: another concurrent request exhausted attempts between pre-check and here
        if (e.message === "MAX_ATTEMPTS_REACHED") return FAILED_RESPONSE;
        throw e;
    }

    if (attemptCount >= 3) {
        return FAILED_RESPONSE;
    }

    return {
        status: "INCORRECT",
        attemptsUsed: attemptCount,
        attemptsLeft: 3 - attemptCount
    };
}
