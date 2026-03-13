import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { getAllTeamsController } from "@/controllers/adminTeamsController";

export async function GET(req: NextRequest) {
    try {
        // authenticate
        const user = await verifyToken(req);
        // authorize
        validateAdmin(user);
        
        // controller
        const teams = await getAllTeamsController();

        return NextResponse.json({
            success: true,
            teams
        });

    } catch (err: any) {
        console.error("ADMIN_GET_TEAMS_ERROR:", err.message);

        return NextResponse.json(
            {
                success: false,
                error: err.message || "FAILED_TO_FETCH_TEAMS"
            },
            { status: 400 }
        );
    }
}