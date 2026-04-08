import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { restartGameController } from "@/controllers/gameController";
import { isValidUUID } from "@/lib/validateUUID";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ gameId: string }> }
) {

    try {

        const user = await verifyToken(req);
        validateAdmin(user);

        const { gameId } = await context.params;

        if (!isValidUUID(gameId)) {
            return NextResponse.json({ success: false, error: "INVALID_GAME_ID" }, { status: 400 });
        }

        const game = await restartGameController(gameId);

        return NextResponse.json({
            success: true,
            game
        });

    } catch (err: any) {

        console.error("ADMIN_RESTART_GAME_ERROR:", err.message);

        return NextResponse.json(
            { success: false, error: err.message },
            { status: 400 }
        );
    }
}