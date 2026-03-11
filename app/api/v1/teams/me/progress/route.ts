import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { getTeamProgressController } from "@/controllers/gameController";

export async function GET(req: NextRequest) {
    try {

        const user = verifyToken(req);

        const teamId = user.teamId;

        if (!teamId) {
            throw new Error("TEAM_ID_MISSING_FROM_TOKEN");
        }

        const result = await getTeamProgressController(teamId);

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error: any) {

        console.error("[Route:/teams/me/progress]", error.message);

        return NextResponse.json(
            { error: "TEAM_PROGRESS_FETCH_FAILED" },
            { status: 500 }
        );
    }
}