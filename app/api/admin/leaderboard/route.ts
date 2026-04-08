import { NextRequest, NextResponse } from "next/server";
import { getLeaderboardService } from "@/services/leaderboardService";
import { validateAdmin } from "@/middleware/validateAdmin";
import { verifyToken } from "@/middleware/verifyToken";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyToken(req);

        validateAdmin(user);

        const leaderboard = await getLeaderboardService();

        return NextResponse.json({
            success: true,
            leaderboard,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message ?? "FAILED_TO_FETCH_LEADERBOARD",
            },
            { status: 400 }
        );
    }
}
