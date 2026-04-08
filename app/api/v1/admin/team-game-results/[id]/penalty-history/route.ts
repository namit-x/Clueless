import { NextRequest, NextResponse } from "next/server";
import { getPenaltyHistoryController } from "@/controllers/adminPenaltyController";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { isValidUUID } from "@/lib/validateUUID";

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
        default:
            return 500;
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!isValidUUID(id)) {
            return NextResponse.json({ success: false, error: "INVALID_ID" }, { status: 400 });
        }

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
