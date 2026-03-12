import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { getAllGamesController } from "@/controllers/gameController";

export async function GET(req: NextRequest) {
    try {

        const user = await verifyToken(req);

        const result = await getAllGamesController(user);

        return NextResponse.json({
            success: true,
            games: result
        });

    } catch (error: any) {

        if (error.message === "Unauthorized") {
            return NextResponse.json(
                { error: "Unauthorized: authentication token missing" },
                { status: 401 }
            );
        }

        if (error.message === "Invalid token") {
            return NextResponse.json(
                { error: "Invalid or expired authentication token" },
                { status: 401 }
            );
        }

        console.error("[Route:/api/v1/games]", error.message);

        return NextResponse.json(
            { error: "Unexpected server error while fetching games" },
            { status: 500 }
        );
    }
}
