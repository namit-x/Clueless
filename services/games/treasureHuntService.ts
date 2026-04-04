import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo, getTeamRouteRepo, insertTeamRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import {
    activateFirstRoundRepo,
    getActiveOrFailedRoundRepo,
    getRoundAttemptStatusRepo,
    initializeTeamRoundProgressRepo,
    submitAndAdvanceRoundRepo,
    submitAndDecrementAttemptRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";
import { getClueAndAnswerForRoundRepo, getClueForRoundRepo, getRoundClueRepo } from "@/lib/repositories/routeLocationsRepo";
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
    const progress = await getRoundAttemptStatusRepo(teamId, roundId);
    if (progress.status !== 'ACTIVE' || progress.attemptCount >= 3) {
        return FAILED_RESPONSE;
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
            return FAILED_RESPONSE;
        }

        if (roundNumber === 3) {
            await completeTeamGameResult(teamId, gameId);
            return { status: "COMPLETED" };
        }

        return { status: "CORRECT" };
    }

    // Atomic: insert wrong submission + decrement attempts in one transaction
    const result = await submitAndDecrementAttemptRepo(
        teamId, roundId, answer, "Treasure Hunt"
    );

    if (!result) {
        return FAILED_RESPONSE;
    }

    if (result.attemptCount >= 3) {
        return FAILED_RESPONSE;
    }

    return {
        status: "INCORRECT",
        attemptsUsed: result.attemptCount,
        attemptsLeft: 3 - result.attemptCount
    };
}
