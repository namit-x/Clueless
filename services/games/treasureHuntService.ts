import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo, getTeamRouteRepo, insertTeamRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import {
    activateFirstRoundRepo,
    completeAndAdvanceRoundRepo,
    decreaseAttemptRepo,
    getCurrentRoundRepo,
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

    return activateGameRepo(gameId);
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

    const [routeId, { roundId, roundNumber }] = await Promise.all([
        getTeamRouteRepo(teamId),
        getCurrentRoundRepo(teamId)
    ]);

    const clue = await getClueForRoundRepo(routeId, roundNumber);

    return {
        roundId,
        round: roundNumber,
        clue
    };
}

export async function submitTreasureHuntAnswer(
    teamId: string,
    roundId: string,
    answer: string,
    roundNumber: number,
    gameId: string
) {

    const routeId = await getTeamRouteRepo(teamId);
    const { correctAnswer } = await getClueAndAnswerForRoundRepo(routeId, roundNumber);

    const isCorrect = correctAnswer.toLowerCase() === answer.trim().toLowerCase();

    await insertSubmissionRepo(teamId, roundId, answer, isCorrect, "Treasure Hunt");

    if (isCorrect) {

        const advanced = await completeAndAdvanceRoundRepo(teamId, roundId, roundNumber, gameId);

        if (advanced && roundNumber === 3) {
            await completeTeamGameResult(teamId, gameId);
            return { correct: true, gameCompleted: true };
        }

        return {
            correct: true
        };
    }

    const attemptCount = await decreaseAttemptRepo(teamId, roundId);

    return {
        correct: false,
        attemptsLeft: 3 - attemptCount
    };
}
