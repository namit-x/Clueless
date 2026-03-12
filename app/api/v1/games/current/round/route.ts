import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { getCurrentRoundController } from "@/controllers/gameController";

export async function GET(req: NextRequest) {
    try {

        const user = await verifyToken(req);

        const teamId = user.teamId;

        if (!teamId) {
            throw new Error("TEAM_ID_MISSING_FROM_TOKEN");
        }

        const result = await getCurrentRoundController(teamId);

        return NextResponse.json({
            success: true,
            ...result
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

        console.error(
            "[Route:/api/game/current/round] Unexpected route error:",
            error.message
        );

        return NextResponse.json(
            { error: "Unexpected server error while processing request" },
            { status: 500 }
        );
    }
}