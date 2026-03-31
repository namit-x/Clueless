import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { getAllMembersController } from "@/controllers/adminMembersController";

export async function GET(req: NextRequest) {
    try {
        // authenticate
        const user = await verifyToken(req);

        // authorize
        validateAdmin(user);

        // controller
        const members = await getAllMembersController();

        return NextResponse.json({
            success: true,
            members
        });

    } catch (err: any) {
        console.error("ADMIN_GET_MEMBERS_ERROR:", err.message);

        return NextResponse.json(
            {
                success: false,
                error: err.message || "FAILED_TO_FETCH_MEMBERS"
            },
            { status: 400 }
        );
    }
}
