import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { submitFinalAnswerController } from "@/controllers/finalSubmissionController";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ gameId: string }> }
) {

    try {

        const user = await verifyToken(req);

        const teamId = user.teamId;

        if (!teamId) {
            throw new Error("TEAM_ID_MISSING_FROM_TOKEN");
        }

        const { gameId } = await context.params;

        const body = await req.json();

        const result = await submitFinalAnswerController(
            teamId,
            gameId,
            body.answer
        );

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (err: any) {

        console.error("FINAL_SUBMISSION_ERROR:", err.message);

        return NextResponse.json(
            { success: false, error: err.message },
            { status: 400 }
        );
    }
}
