import { supabaseAdmin } from "@/lib/supabase/server";
import { getGameByIdRepo, activateGameRepo, endGameRepo } from "@/lib/repositories/gameRepo";
import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo, insertTeamRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import { initializeTeamRoundProgressRepo } from "@/lib/repositories/teamRoundProgressRepo";


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

export async function getCurrentGameForTeam() {
    try {
        const { data, error } = await supabaseAdmin
            .from("games")
            .select("id, name, description, order_index, status")
            .eq("is_active", false)
            .order("order_index", { ascending: true })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(
                "[GameService][getCurrentGameForTeam] Database query failed:",
                error.message
            );
            throw new Error("Database error while fetching current game");
        }

        return data;
    } catch (error: any) {
        console.error(
            "[GameService][getCurrentGameForTeam] Unexpected service error:",
            error.message
        );
        throw new Error("Service failed to retrieve current game");
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

    if (game.status !== "ACTIVE") {
        throw new Error("GAME_NOT_ACTIVE");
    }

    const endedGame = await endGameRepo(gameId);

    return endedGame;
}