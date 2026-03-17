import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { getAllTeamsProgressController } from "@/controllers/adminProgressController";

export async function GET(req: NextRequest) {
    try {
        // authenticate
        const user = await verifyToken(req);

        // authorize
        validateAdmin(user);

        // controller
        const teams = await getAllTeamsProgressController();

        return NextResponse.json({
            success: true,
            teams
        });

    } catch (err: any) {
        console.error("ADMIN_GET_TEAMS_PROGRESS_ERROR:", err.message);

        return NextResponse.json(
            {
                success: false,
                error: err.message || "FAILED_TO_FETCH_TEAMS_PROGRESS"
            },
            { status: 400 }
        );
    }
}
