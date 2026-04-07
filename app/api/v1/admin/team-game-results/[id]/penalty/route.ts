import { NextRequest, NextResponse } from "next/server";
import { adjustPenaltyController } from "@/controllers/adminPenaltyController";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";

/**
 * Normalize an unknown error into a concise error message string.
 *
 * @param error - The error value to normalize; may be any type.
 * @returns The last segment of the error's message after the final `": "` delimiter, or `"INTERNAL_SERVER_ERROR"` if `error` is not an `Error`. 
 */
function unwrapErrorMessage(error: unknown) {
    if (!(error instanceof Error)) {
        return "INTERNAL_SERVER_ERROR";
    }

    const parts = error.message.split(": ");
    return parts[parts.length - 1] || error.message;
}

/**
 * Map an error message to the corresponding HTTP status code.
 *
 * @param message - The error message used to determine the HTTP status
 * @returns The HTTP status code: `401` for "Unauthorized" or "Invalid token"; `403` for "Forbidden"; `404` for "TEAM_GAME_RESULT_NOT_FOUND"; `400` for "INVALID_OPERATION", "INVALID_PENALTY_VALUE", "REASON_REQUIRED", or "PENALTY_OUT_OF_RANGE"; `500` for any other message
 */
function getStatusCode(message: string) {
    switch (message) {
        case "Unauthorized":
        case "Invalid token":
            return 401;
        case "Forbidden":
            return 403;
        case "TEAM_GAME_RESULT_NOT_FOUND":
            return 404;
        case "INVALID_OPERATION":
        case "INVALID_PENALTY_VALUE":
        case "REASON_REQUIRED":
        case "PENALTY_OUT_OF_RANGE":
            return 400;
        default:
            return 500;
    }
}

/**
 * Handles PATCH requests to update the penalty for a team game result identified by the route `id`.
 *
 * Parses the request body, verifies the caller is an admin with a valid `adminName`, and delegates the update to the controller. On success returns a JSON payload with `success: true` and `data` containing `team_game_result_id`, `old_penalty`, and `new_penalty`. On failure returns `success: false` and an `error` message with an HTTP status code mapped from the error.
 *
 * @param req - The incoming Next.js request
 * @param params - An object (as a Promise) resolving to the route parameters; must contain `id` for the target team game result
 * @returns A JSON response: on success `{ success: true, data: { team_game_result_id, old_penalty, new_penalty } }`; on error `{ success: false, error }` with an appropriate HTTP status code (401, 403, 404, 400, or 500)
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await verifyToken(req);

        validateAdmin(user);

        if (!user.adminName) {
            throw new Error("Invalid admin identity");
        }

        const body = await req.json();
        const result = await adjustPenaltyController(id, body, user.adminName);

        return NextResponse.json({
            success: true,
            data: {
                team_game_result_id: result.teamGameResultId,
                old_penalty: result.oldPenalty,
                new_penalty: result.newPenalty,
            },
        });
    } catch (error: unknown) {
        const message = unwrapErrorMessage(error);

        console.error("ADMIN_ADJUST_PENALTY_ERROR:", message);

        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status: getStatusCode(message) }
        );
    }
}
