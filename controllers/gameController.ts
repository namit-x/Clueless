import { createGame, getCurrentRoundService, getTeamProgressService, startTeamGameService } from "@/services/gameService";
import { NextResponse } from "next/server";
import { getCurrentGameForTeam } from "@/services/gameService";
import { startGameService } from "@/services/gameService";
import { endGameService } from "@/services/gameService";
import { pauseGameService } from "@/services/gameService";
import { restartGameService } from "@/services/gameService";
import { getAllGamesService } from "@/services/gameService";
import { resumeGameService } from "@/services/gameService";

export async function createGameController(body: any) {
    const game = await createGame(body);
    return game;
}

export async function getCurrentGameController(user: any) {
    try {
        if (!user) {
            console.error("[GameController] Missing authenticated user context");
            return NextResponse.json(
                { error: "Unauthorized request: user context missing" },
                { status: 401 }
            );
        }

        const game = await getCurrentGameForTeam();

        if (!game) {
            console.warn(
                "[GameController] No active game found in database"
            );

            return NextResponse.json(
                { error: "No active game available at the moment" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                game,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(
            "[GameController] Failed to fetch current game:",
            error.message
        );

        return NextResponse.json(
            {
                error: "Internal server error while retrieving current game",
            },
            { status: 500 }
        );
    }
}

export async function startGameController(gameId: string) {
    try {

        const game = await startGameService(gameId);

        return game;

    } catch (error: any) {
        throw new Error(`CONTROLLER_START_GAME_FAILED: ${error.message}`);
    }
}


export async function endGameController(gameId: string) {

    try {

        const game = await endGameService(gameId);

        return game;

    } catch (error: any) {
        throw new Error(`CONTROLLER_END_GAME_FAILED: ${error.message}`);
    }
}

export async function pauseGameController(gameId: string) {

    try {

        const game = await pauseGameService(gameId);

        return game;

    } catch (error: any) {
        throw new Error(`CONTROLLER_PAUSE_GAME_FAILED: ${error.message}`);
    }
}


export async function restartGameController(gameId: string) {

    try {

        const game = await restartGameService(gameId);

        return game;

    } catch (error: any) {

        throw new Error(`CONTROLLER_RESTART_GAME_FAILED: ${error.message}`);

    }
}

export async function startTeamGameController(teamId: string) {

    try {

        const roundData = await startTeamGameService(teamId);

        return roundData;

    } catch (error: any) {

        throw new Error(`CONTROLLER_START_TEAM_GAME_FAILED: ${error.message}`);

    }
}

export async function getCurrentRoundController(teamId: string) {

    try {
        
        const roundData = await getCurrentRoundService(teamId);

        return roundData;

    } catch (error: any) {

        throw new Error(`CONTROLLER_GET_CURRENT_ROUND_FAILED: ${error.message}`);

    }
}

export async function getTeamProgressController(teamId: string) {

    try {

        const progress = await getTeamProgressService(teamId);

        return progress;

    } catch (error: any) {

        throw new Error(`CONTROLLER_GET_TEAM_PROGRESS_FAILED: ${error.message}`);

    }
}

export async function getAllGamesController(user: any) {

    try {

        const games = await getAllGamesService();

        return games;

    } catch (error: any) {

        throw new Error(`CONTROLLER_GET_ALL_GAMES_FAILED: ${error.message}`);

    }
}

export async function resumeGameController(gameId: string) {

    try {

        const game = await resumeGameService(gameId);

        return game;

    } catch (error: any) {

        throw new Error(`CONTROLLER_RESUME_GAME_FAILED: ${error.message}`);

    }
}