import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { getCurrentRoundController } from "@/controllers/gameController";

/**
 * Handle GET requests to return the current game round data for the authenticated user's team.
 *
 * Expects an authentication token in the request; the token must include a `teamId`.
 *
 * @param req - The incoming request containing the authentication token
 * @returns On success, a JSON payload with `success: true` and the current round data (HTTP 200). 
 *          If the authentication token is missing or invalid, a JSON error with HTTP 401:
 *            - `{ error: "Unauthorized: authentication token missing" }` for missing token
 *            - `{ error: "Invalid or expired authentication token" }` for invalid/expired token
 *          For other failures (including a token that lacks `teamId`), a JSON error with HTTP 500:
 *            - `{ error: "Unexpected server error while processing request" }`
 */
export async function GET(req: NextRequest) {
    try {

        const user = await verifyToken(req);

        const teamId = user.teamId;
        // console.log(teamId);

        if (!teamId) {
            throw new Error("TEAM_ID_MISSING_FROM_TOKEN");
        }

        const result = await getCurrentRoundController(teamId);

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error: any) {

        if (error.message === "Unauthorized") {
            return NextResponse.json(
                { error: "Unauthorized: authentication token missing" },
                { status: 401 }
            );
        }

        if (error.message === "Invalid token") {
            return NextResponse.json(
                { error: "Invalid or expired authentication token" },
                { status: 401 }
            );
        }

        console.error(
            "[Route:/api/game/current/round] Unexpected route error:",
            error.message
        );

        return NextResponse.json(
            { error: "Unexpected server error while processing request" },
            { status: 500 }
        );
    }
}