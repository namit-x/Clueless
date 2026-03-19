import { supabaseAdmin } from "@/lib/supabase/server";
import { getActiveGameRepo, getAllGamesRepo, getGameByIdRepo, endGameRepo, restartGameRepo } from "@/lib/repositories/gameRepo";
import { getTeamProgressRepo } from "@/lib/repositories/teamProgressRepo";
import { startTreasureHuntGame } from "./games/treasureHuntService";
import { startBlindCodeGame } from "./games/blindCodeService";
import { startQuizGame } from "./games/quizService";
import { startDigitManipulationGame } from "./games/digitManipulationService";
import { currentRoundHandlers, teamStartHandlers } from "./games/gameplayHandlers";
import { createTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";
import { markTimedOutTeamGameResults } from "@/lib/repositories/teamGameResultsRepo";
import { deleteTeamGameResultsByGameId } from "@/lib/repositories/teamGameResultsRepo";

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
        const data = await getAllGamesRepo();

        return data.map((game) => ({
            id: game.status !== "LIVE" ? "YOU_ARE_GAY" : game.id,
            name: game.name,
            description: game.description,
            order_index: game.order_index,
            is_active: game.is_active,
            status: game.status
        }));

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

    await markTimedOutTeamGameResults(gameId, 600);

    const endedGame = await endGameRepo(gameId);

    return endedGame;
}

export async function restartGameService(gameId: string) {

    const game = await getGameByIdRepo(gameId);

    if (!game) {
        throw new Error("GAME_NOT_FOUND");
    }

    await deleteTeamGameResultsByGameId(gameId);

    const restartedGame = await restartGameRepo(gameId);

    return restartedGame;
}

export async function getCurrentRoundService(teamId: string) {

    const game = await getActiveGameRepo();
    console.log(`[GameService] Fetching current round for team ${teamId} in game ${game ? game.name : "NO_ACTIVE_GAME"}`);
    const handler = currentRoundHandlers[game.name];

    if (!handler) {
        throw new Error(`UNKNOWN_GAME_TYPE: ${game.name}`);
    }

    return handler(teamId);
}

export async function startTeamGameService(teamId: string, gameId: string) {

    const game = await getGameByIdRepo(gameId);

    if (!game) {
        throw new Error("GAME_NOT_FOUND");
    }

    // START TIMER FOR TEAM
    await createTeamGameResult(teamId, gameId);

    const handler = teamStartHandlers[game.name];

    if (!handler) {
        throw new Error(`UNKNOWN_GAME_TYPE: ${game.name}`);
    }

    return handler(teamId);
}

export async function getTeamProgressService(teamId: string) {

    const progress = await getTeamProgressRepo(teamId);

    return progress;

}

export async function getAllGamesService() {

    return getAllGamesRepo();

}

