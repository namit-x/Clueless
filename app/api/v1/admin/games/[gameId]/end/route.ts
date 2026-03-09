import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { endGameController } from "@/controllers/gameController";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ gameId: string }> }
) {

    try {

        const user = verifyToken(req);

        validateAdmin(user);

        const { gameId } = await context.params;

        const game = await endGameController(gameId);

        return NextResponse.json({
            success: true,
            game
        });

    } catch (err: any) {

        console.error("ADMIN_END_GAME_ERROR:", err.message);

        return NextResponse.json(
            { success: false, error: err.message },
            { status: 400 }
        );
    }
}