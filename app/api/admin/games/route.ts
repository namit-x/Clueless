import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { gameSchema } from "@/validators/gameSchema";
import { createGameController } from "@/controllers/gameController";

/**
 * Create a new game from the request body after authenticating and authorizing the caller.
 *
 * @param req - Incoming request whose JSON body must conform to `gameSchema`
 * @returns On success, an object `{ success: true, game }` containing the created game; on failure, `{ success: false, error }` with an error message (response status 400)
 */
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