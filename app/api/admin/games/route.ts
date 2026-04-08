import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { gameSchema } from "@/validators/gameSchema";
import { createGameController } from "@/controllers/gameController";

export async function POST(req: NextRequest) {
    try {
        // authenticate
        const user = await verifyToken(req);

        // authorize
        validateAdmin(user);

        // parse body
        const body = await req.json();

        // validate
        const parsed = gameSchema.parse(body);

        // controller
        const game = await createGameController(parsed);

        return NextResponse.json({ success: true, game });

    } catch (err: any) {
        // console.log(err.message);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 400 }
        );
    }
}