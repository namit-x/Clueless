import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { startTeamGameController } from "@/controllers/gameController";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ gameId: string }> }
) {

    try {

        const user = await verifyToken(req);

        const teamId = user.teamId;

        if (!teamId) {
            throw new Error("TEAM_ID_MISSING_FROM_TOKEN");
        }

        const { gameId } = await context.params;
        const result = await startTeamGameController(teamId, gameId);

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (err: any) {

        console.error("TEAM_START_GAME_ERROR:", err.message);

        return NextResponse.json(
            { success: false, error: err.message },
            { status: 400 }
        );
    }
}


// I'M SEEING WHERE IS THE FUNCTION through WHICH THE USER IS STARTING THE GAME.