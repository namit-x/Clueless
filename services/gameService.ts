import { supabaseAdmin } from "@/lib/supabase/server";
import { getGameByIdRepo, activateGameRepo, endGameRepo } from "@/lib/repositories/gameRepo";
import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo, getTeamRouteRepo, insertTeamRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import { activateFirstRoundRepo, getCurrentRoundRepo, initializeTeamRoundProgressRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { pauseGameRepo } from "@/lib/repositories/gameRepo";
import { restartGameRepo } from "@/lib/repositories/gameRepo";
import { getClueForRoundRepo, getRoundClueRepo } from "@/lib/repositories/routeLocationsRepo";
import { getTeamProgressRepo } from "@/lib/repositories/teamProgressRepo";
import { getAllGamesRepo } from "@/lib/repositories/gameRepo";
import { resumeGameRepo } from "@/lib/repositories/gameRepo";

export async function createGame(data: any) {
    const { id, ...gameData } = data;
    const { data: game, error } = await supabaseAdmin
        .from("games")
        .insert([gameData])
        .select()
        .single();

    if (error) {
        console.log(error.message);
        throw new Error(error.message);
    }

    return game;
}

export async function getGamesForTeam() {
    try {

        const { data, error } = await supabaseAdmin
            .from("games")
            .select("id, name, description, order_index, status")
            .order("order_index", { ascending: true });

        if (error) {
            console.error(
                "[GameService][getGamesForTeam] Database query failed:",
                error.message
            );
            throw new Error("Database error while fetching games");
        }

        const games = data.map((game) => ({
            id: game.status === "LIVE" || game.status === "PAUSED" ? game.id : null,
            name: game.name,
            description: game.description,
            order_index: game.order_index,
            status: game.status
        }));

        return games;

    } catch (error: any) {

        console.error(
            "[GameService][getGamesForTeam] Unexpected service error:",
            error.message
        );

        throw new Error("Service failed to retrieve games");
    }
}

export async function startGameService(gameId: string) {

    const game = await getGameByIdRepo(gameId);

    if (game.status !== "NOT_STARTED") {
        throw new Error("GAME_ALREADY_STARTED_OR_INVALID_STATE");
    }

    const teams = await getApprovedTeamsRepo();
    const routes = await getAllRoutesRepo();

    if (routes.length < teams.length) {
        throw new Error("INSUFFICIENT_ROUTES");
    }

    const mappings = teams.map((team: any, i: number) => ({
        team_id: team.team_id,
        route_id: routes[i].id
    }));

    console.log("ROUTE_ASSIGNMENT_DEBUG", {
        approvedTeams: teams.length,
        routes: routes.length,
        mappings: mappings.length
    });

    await insertTeamRoutesRepo(mappings);

    await initializeTeamRoundProgressRepo();

    const activeGame = await activateGameRepo(gameId);

    return activeGame;
}

export async function endGameService(gameId: string) {

    const game = await getGameByIdRepo(gameId);

    if (game.status !== "ZZ") {
        throw new Error("GAME_NOT_ACTIVE");
    }

    const endedGame = await endGameRepo(gameId);

    return endedGame;
}


export async function pauseGameService(gameId: string) {

    const game = await getGameByIdRepo(gameId);

    if (game.status !== "ACTIVE") {
        throw new Error("GAME_NOT_ACTIVE_CANNOT_PAUSE");
    }

    const pausedGame = await pauseGameRepo(gameId);

    return pausedGame;
}

export async function restartGameService(gameId: string) {

    const game = await getGameByIdRepo(gameId);

    if (!game) {
        throw new Error("GAME_NOT_FOUND");
    }

    const restartedGame = await restartGameRepo(gameId);

    return restartedGame;
}

export async function startTeamGameService(teamId: string) {

    const routeId = await getTeamRouteRepo(teamId);

    const roundId = await activateFirstRoundRepo(teamId);

    const clue = await getRoundClueRepo(routeId, 1);

    return {
        round: 1,
        clue
    };
}

export async function getCurrentRoundService(teamId: string) {

    const routeId = await getTeamRouteRepo(teamId);

    const { roundId, roundNumber } = await getCurrentRoundRepo(teamId);

    const clue = await getClueForRoundRepo(routeId, roundNumber);

    return {
        roundId,
        round: roundNumber,
        clue
    };
}

export async function getTeamProgressService(teamId: string) {

    const progress = await getTeamProgressRepo(teamId);

    return progress;

}

export async function getAllGamesService() {

    const games = await getAllGamesRepo();

    return games;

}

export async function resumeGameService(gameId: string) {

    try {

        const game = await resumeGameRepo(gameId);

        return game;

    } catch (error: any) {

        throw new Error(`SERVICE_RESUME_GAME_FAILED: ${error.message}`);

    }
}
// f2fbfb07 - 8715 - 4792 - a0c9 - 439bf62804e5