import { NextRequest, NextResponse } from "next/server";
import { adjustPenaltyController } from "@/controllers/adminPenaltyController";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";

function unwrapErrorMessage(error: unknown) {
    if (!(error instanceof Error)) {
        return "INTERNAL_SERVER_ERROR";
    }

    const parts = error.message.split(": ");
    return parts[parts.length - 1] || error.message;
}

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
