import { supabaseAdmin } from "@/lib/supabase/server";
import { getGameByIdRepo, activateGameRepo, endGameRepo } from "@/lib/repositories/gameRepo";
import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo, getTeamRouteRepo, insertTeamRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import { activateFirstRoundRepo, getCurrentRoundRepo, initializeTeamRoundProgressRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { restartGameRepo } from "@/lib/repositories/gameRepo";
import { getClueForRoundRepo, getRoundClueRepo } from "@/lib/repositories/routeLocationsRepo";
import { getTeamProgressRepo } from "@/lib/repositories/teamProgressRepo";
import { getAllGamesRepo } from "@/lib/repositories/gameRepo";
import { startTreasureHuntGame } from "./games/treasureHuntService";
import { startBlindCodeGame } from "./games/blindCodeService";
import { startQuizGame } from "./games/quizService";
import { startDigitManipulationGame } from "./games/digitManipulationService";

/**
 * Game Handler Registry
 * 
 * Maps game names to their corresponding start handler functions.
 * When a new game type is added, register it here.
 * 
 * @example
 * "Treasure Hunt" → startTreasureHuntGame
 * "Blind Code" → startBlindCodeGame
 * "Quiz" → startQuizGame
 * "Digit Manipulation" → startDigitManipulationGame
 */
const gameHandlers: Record<string, (gameId: string) => Promise<any>> = {
    "Treasure Hunt": startTreasureHuntGame,
    "Blind Code": startBlindCodeGame,
    "Quiz": startQuizGame,
    "Digit Manipulation": startDigitManipulationGame,
};

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
            .select("id, name, description, order_index, is_active")
            .eq("is_active", true)
            .order("order_index", { ascending: true });

        if (error) {
            console.error(
                "[GameService][getGamesForTeam] Database query failed:",
                error.message
            );
            throw new Error("Database error while fetching games");
        }

        const games = data.map((game) => ({
            id: game.id,
            name: game.name,
            description: game.description,
            order_index: game.order_index,
            is_active: game.is_active
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

/**
 * Start Game Dispatcher
 * 
 * Routes game start requests to the appropriate game-specific handler.
 * 
 * Flow:
 * 1. Fetch game metadata
 * 2. Validate game state (not already started)
 * 3. Dispatch to registered game handler
 * 4. Handler initializes rounds, assigns routes, and activates game
 * 
 * @param gameId - The ID of the game to start
 * @returns - Updated game object from handler
 * 
 * @throws GAME_NOT_FOUND - Game does not exist
 * @throws GAME_ALREADY_STARTED - Game is already active
 * @throws UNKNOWN_GAME_TYPE - Game type not registered
 */
export async function startGameService(gameId: string) {

    try {

        // Step 1: Fetch game metadata
        const game = await getGameByIdRepo(gameId);

        if (!game) {
            throw new Error("GAME_NOT_FOUND");
        }

        // Step 2: Validate game state
        if (game.is_active === true) {
            throw new Error("GAME_ALREADY_STARTED");
        }

        // Step 3: Dispatch to registered handler
        const handler = gameHandlers[game.name];

        if (!handler) {
            throw new Error(`UNKNOWN_GAME_TYPE: ${game.name}`);
        }

        // Step 4: Execute game-specific initialization
        return await handler(gameId);

    } catch (error: any) {
        throw error;
    }
}

export async function endGameService(gameId: string) {

    const game = await getGameByIdRepo(gameId);

    if (game.is_active !== true) {
        throw new Error("GAME_NOT_ACTIVE");
    }

    const endedGame = await endGameRepo(gameId);

    return endedGame;
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