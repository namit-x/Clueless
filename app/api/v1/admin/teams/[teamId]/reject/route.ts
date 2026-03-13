import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { rejectTeamController } from "@/controllers/adminTeamsController";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        // resolve dynamic params
        const { teamId } = await params;

        // authenticate
        const user = await verifyToken(req);

        // authorize
        validateAdmin(user);

        // controller
        const team = await rejectTeamController(teamId);

        return NextResponse.json({
            success: true,
            team
        });

    } catch (err: any) {
        console.error("ADMIN_REJECT_TEAM_ERROR:", err?.message);

        return NextResponse.json(
            {
                success: false,
                error: err?.message || "INTERNAL_SERVER_ERROR"
            },
            { status: 400 }
        );
    }
}