import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo, getTeamRouteRepo, insertTeamRoutesRepo, assignLateTeamRouteRepo } from "@/lib/repositories/teamRoutesRepo";
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

    // Get route — assign one on the fly if team was approved after game start
    let routeId: string;
    try {
        routeId = await getTeamRouteRepo(teamId);
    } catch (e: any) {
        if (e.message === "TEAM_ROUTE_NOT_FOUND") {
            routeId = await assignLateTeamRouteRepo(teamId);
        } else {
            throw e;
        }
    }

    await activateFirstRoundRepo(teamId, gameId);

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
