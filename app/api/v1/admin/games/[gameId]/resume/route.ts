import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { resumeGameController } from "@/controllers/gameController";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ gameId: string }> }
) {

    try {

        const user = verifyToken(req);

        validateAdmin(user);

        const { gameId } = await context.params;

        const result = await resumeGameController(gameId);

        return NextResponse.json({
            success: true,
            game: result
        });

    } catch (error: any) {

        console.error("[Route:/admin/games/resume]", error.message);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 400 }
        );
    }
}