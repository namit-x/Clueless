import { createGameRepo, getActiveGameRepo, getTeamActiveGameRepo, getAllGamesRepo, getGameByIdRepo, endGameRepo, restartGameRepo } from "@/lib/repositories/gameRepo";
import { isTeamApprovedRepo } from "@/lib/repositories/teamsRepo";
import { getTeamProgressRepo } from "@/lib/repositories/teamProgressRepo";
import { resolveTeamGameState } from "./teamGameStateResolver";
import { getTeamLatestGameResultRepo } from "@/lib/repositories/teamGameResultsRepo";
import { createTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";
import { initializeTeamRoundProgressForTeamRepo } from "@/lib/repositories/teamRoundProgressRepo";
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
async function getStartGameHandler(gameName: string): Promise<(gameId: string) => Promise<any>> {
    switch (gameName) {
        case "Treasure Hunt":
            return (await import("./games/treasureHuntService")).startTreasureHuntGame;
        case "Blind Code":
            return (await import("./games/blindCodeService")).startBlindCodeGame;
        case "Quiz":
            return (await import("./games/quizService")).startQuizGame;
        case "Digit Manipulation":
            return (await import("./games/digitManipulationService")).startDigitManipulationGame;
        case "Quiz V2":
            return (await import("./games/quizV2Service")).startQuizV2Game;
        default:
            throw new Error(`UNKNOWN_GAME_TYPE: ${gameName}`);
    }
}

async function getCurrentRoundHandler(gameName: string): Promise<(teamId: string, gameId: string) => Promise<any>> {
    switch (gameName) {
        case "Treasure Hunt":
            return (await import("./games/treasureHuntService")).getTreasureHuntRound;
        case "Blind Code":
            return (await import("./games/blindCodeService")).getBlindCodeRound;
        case "Digit Manipulation":
            return (await import("./games/digitManipulationService")).getDigitManipulationRound;
        case "Quiz V2":
            return (await import("./games/quizV2Service")).getQuizV2Round;
        default:
            throw new Error(`UNKNOWN_GAME_TYPE: ${gameName}`);
    }
}

async function getTeamStartHandler(gameName: string): Promise<(teamId: string, gameId: string) => Promise<any>> {
    switch (gameName) {
        case "Treasure Hunt":
            return (await import("./games/treasureHuntService")).startTreasureHuntForTeam;
        case "Blind Code":
            return (await import("./games/blindCodeService")).startBlindCodeForTeam;
        case "Digit Manipulation":
            return (await import("./games/digitManipulationService")).startDigitManipulationForTeam;
        case "Quiz V2":
            return (await import("./games/quizV2Service")).startQuizV2ForTeam;
        default:
            throw new Error(`UNKNOWN_GAME_TYPE: ${gameName}`);
    }
}

export async function createGame(data: any) {
    const { id, ...gameData } = data;
    return await createGameRepo(gameData);
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
        const handler = await getStartGameHandler(game.name);

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

    let gameId: string;
    let gameName: string;

    try {
        // console.log("Finding active game for team:", teamId);
        const activeGame = await getTeamActiveGameRepo(teamId);
        gameId = activeGame.game_id;
        const game = await getGameByIdRepo(gameId);
        gameName = game.name;
    } catch (e: any) {
        if (e.message === "NO_ACTIVE_GAME_FOR_TEAM") {
            // No active/failed rounds — check team_game_results for completed/timed-out games
            const result = await getTeamLatestGameResultRepo(teamId);
            if (!result) throw new Error("NO_ACTIVE_GAME_FOR_TEAM");

            const state = await resolveTeamGameState(teamId, result.game_id);
            return state;
        }
        throw e;
    }

    const state = await resolveTeamGameState(teamId, gameId);

    const isQuizV2FinalPhase =
        gameName === "Quiz V2" &&
        state.teamState === "IN_PROGRESS" &&
        state.messageCode === "ROUND_COMPLETED";

    // Only fetch round data when the resolver says an active round is playable,
    // or when Quiz V2 has transitioned into its final submission phase.
    if (
        state.teamState !== "IN_PROGRESS" ||
        (state.messageCode !== "ROUND_ACTIVE" && !isQuizV2FinalPhase)
    ) {
        return state;
    }

    // IN_PROGRESS — get round-specific data from game handler
    const handler = await getCurrentRoundHandler(gameName);

    const roundData = await handler(teamId, gameId);

    // Strip the old ad-hoc `status` field; teamState + messageCode are authoritative
    const { status: _oldStatus, ...data } = roundData;
    return { ...data, ...state };
}

export async function startTeamGameService(teamId: string, gameId: string) {

    const approved = await isTeamApprovedRepo(teamId);
    if (!approved) {
        throw new Error("TEAM_NOT_APPROVED");
    }

    const game = await getGameByIdRepo(gameId);

    if (!game) {
        throw new Error("GAME_NOT_FOUND");
    }

    if (!game.is_active) {
        throw new Error("GAME_NOT_ACTIVE");
    }

    // START TIMER FOR TEAM
    await createTeamGameResult(teamId, gameId);

    // Ensure team has round progress rows (idempotent — safe for late approvals and retries)
    await initializeTeamRoundProgressForTeamRepo(teamId, gameId);

    const handler = await getTeamStartHandler(game.name);

    return await handler(teamId, gameId);
}

export async function getTeamProgressService(teamId: string) {

    const progress = await getTeamProgressRepo(teamId);

    // Resolve authoritative game state if the team has an active/recent game
    let state = null;
    try {
        const game = await getTeamActiveGameRepo(teamId);
        state = await resolveTeamGameState(teamId, game.game_id);
    } catch (error: any) {
        if (error?.message !== "NO_ACTIVE_GAME_FOR_TEAM") {
            console.error("[GameService][getTeamProgressService] Failed to resolve active game state", {
                teamId,
                error: error?.message ?? "UNKNOWN_ERROR"
            });
            throw error;
        }

        const result = await getTeamLatestGameResultRepo(teamId);
        if (result) {
            state = await resolveTeamGameState(teamId, result.game_id);
        }
    }

    return { progress, ...(state ?? {}) };

}

export async function getAllGamesService() {

    return await getAllGamesRepo();

}
