import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { startGameController } from "@/controllers/gameController";
import { isValidUUID } from "@/lib/validateUUID";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ gameId: string }> }
) {
    try {
        // authenticate
        const user = await verifyToken(req);

        // authorize
        validateAdmin(user);

        // await params (required in newer Next.js versions)
        const { gameId } = await context.params;

        if (!isValidUUID(gameId)) {
            return NextResponse.json({ success: false, error: "INVALID_GAME_ID" }, { status: 400 });
        }

        // controller
        const game = await startGameController(gameId);

        return NextResponse.json({
            success: true,
            game
        });

    } catch (err: any) {

        console.error("ADMIN_START_GAME_ERROR:", {
            message: err.message
            // stack: err.stack
        });

        return NextResponse.json(
            {
                success: false,
                error: err.message || "START_GAME_FAILED"
            },
            { status: 400 }
        );
    }
}