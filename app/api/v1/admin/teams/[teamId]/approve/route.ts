import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { approveTeamController } from "@/controllers/adminTeamsController";
import { isValidUUID } from "@/lib/validateUUID";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        // resolve dynamic route params
        const { teamId } = await params;

        if (!isValidUUID(teamId)) {
            return NextResponse.json({ success: false, error: "INVALID_TEAM_ID" }, { status: 400 });
        }

        // authenticate
        const user = await verifyToken(req);

        // authorize
        validateAdmin(user);

        // controller
        const team = await approveTeamController(teamId);

        return NextResponse.json({
            success: true,
            team
        });

    } catch (err: any) {
        console.error("ADMIN_APPROVE_TEAM_ERROR:", err?.message);

        return NextResponse.json(
            {
                success: false,
                error: err?.message || "INTERNAL_SERVER_ERROR"
            },
            { status: 400 }
        );
    }
}