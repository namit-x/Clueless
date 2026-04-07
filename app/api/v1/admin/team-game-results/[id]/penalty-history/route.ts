import { NextRequest, NextResponse } from "next/server";
import { getPenaltyHistoryController } from "@/controllers/adminPenaltyController";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";

/**
 * Normalize an unknown error into a concise message string.
 *
 * If `error` is an `Error`, returns the last segment of its message after splitting on `": "`, or the full message if no segment is found; if `error` is not an `Error`, returns `"INTERNAL_SERVER_ERROR"`.
 *
 * @param error - The value to normalize into an error message (may be any type)
 * @returns A normalized error message string (`"INTERNAL_SERVER_ERROR"` for non-Error inputs)
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
 * @param message - The error message or identifier used to determine the HTTP status
 * @returns The HTTP status code: `401` for "Unauthorized" or "Invalid token", `403` for "Forbidden", `404` for "TEAM_GAME_RESULT_NOT_FOUND", `500` otherwise
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
        default:
            return 500;
    }
}

/**
 * Handle GET requests to return the admin penalty history for the specified team game result ID.
 *
 * @param req - The incoming Next.js request object
 * @param params - An object promise that resolves to route parameters; expects `{ id }` identifying the team game result
 * @returns A NextResponse containing JSON: on success `{ success: true, data: history }`; on error `{ success: false, error: message }` with an HTTP status mapped from the error message
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await verifyToken(req);

        validateAdmin(user);

        const history = await getPenaltyHistoryController(id);

        return NextResponse.json({
            success: true,
            data: history,
        });
    } catch (error: unknown) {
        const message = unwrapErrorMessage(error);

        console.error("ADMIN_PENALTY_HISTORY_ERROR:", message);

        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status: getStatusCode(message) }
        );
    }
}
