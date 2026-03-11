// FETCHES THE CURRENT GAME

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { getGamesController } from "@/controllers/gameController";

export async function GET(req: NextRequest) {
    try {
        const user = verifyToken(req);

        return getGamesController(user);

    } catch (error: any) {
        if (error.message === "Unauthorized") {
            console.warn("[Route:/api/game/current] Missing authentication token");

            return NextResponse.json(
                { error: "Unauthorized: authentication token missing" },
                { status: 401 }
            );
        }

        if (error.message === "Invalid token") {
            console.warn("[Route:/api/game/current] Invalid or expired token");

            return NextResponse.json(
                { error: "Invalid or expired authentication token" },
                { status: 401 }
            );
        }

        console.error(
            "[Route:/api/game/current] Unexpected route error:",
            error.message
        );

        return NextResponse.json(
            { error: "Unexpected server error while processing request" },
            { status: 500 }
        );
    }
}