import { NextRequest, NextResponse } from "next/server";
import { getLeaderboardService } from "@/services/leaderboardService";
import { validateAdmin } from "@/middleware/validateAdmin";
import { verifyToken } from "@/middleware/verifyToken";

/**
 * Handle GET requests to retrieve the admin leaderboard after authenticating and authorizing the requester.
 *
 * @returns A NextResponse containing `{ success: true, leaderboard }` when the authenticated user is an admin and the leaderboard is fetched successfully; otherwise a NextResponse with `{ success: false, error }` and status 400.
 */
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
