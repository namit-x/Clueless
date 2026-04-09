import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/middleware/verifyToken";
import { submitFinalAnswerController } from "@/controllers/finalSubmissionController";
import { isValidUUID } from "@/lib/validateUUID";

const submissionSchema = z.object({
    answer: z.string().min(1, "Answer cannot be empty").max(1000),
});

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

        if (!isValidUUID(gameId)) {
            return NextResponse.json({ success: false, error: "INVALID_GAME_ID" }, { status: 400 });
        }

        const rawBody = await req.json();
        const parsed = submissionSchema.safeParse(rawBody);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 }
            );
        }

        const result = await submitFinalAnswerController(
            teamId,
            gameId,
            parsed.data.answer
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
