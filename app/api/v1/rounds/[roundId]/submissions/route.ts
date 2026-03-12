import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { submitAnswerController } from "@/controllers/submissionController";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ roundId: string }> }
) {

    try {

        const user = await verifyToken(req);

        const teamId = user.teamId;

        if (!teamId) {
            throw new Error("TEAM_ID_MISSING_FROM_TOKEN");
        }

        const { roundId } = await context.params;

        const body = await req.json();

        const result = await submitAnswerController(
            teamId,
            roundId,
            body.answer
        );

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (err: any) {

        console.error("SUBMISSION_ERROR:", err.message);

        return NextResponse.json(
            { success: false, error: err.message },
            { status: 400 }
        );
    }
}