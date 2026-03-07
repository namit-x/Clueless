import { createGame } from "@/services/gameService";
import { NextResponse } from "next/server";
import { getCurrentGameForTeam } from "@/services/gameService";

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