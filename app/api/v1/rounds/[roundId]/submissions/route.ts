import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/middleware/verifyToken";
import { submitAnswerController } from "@/controllers/submissionController";
import { isValidUUID } from "@/lib/validateUUID";

const submissionSchema = z.object({
    answer: z.string().min(1, "Answer cannot be empty").max(1000),
});

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

        if (!isValidUUID(roundId)) {
            return NextResponse.json({ success: false, error: "INVALID_ROUND_ID" }, { status: 400 });
        }

        const rawBody = await req.json();
        const parsed = submissionSchema.safeParse(rawBody);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "INVALID_INPUT", message: parsed.error.errors[0].message },
                { status: 400 }
            );
        }

        const result = await submitAnswerController(
            teamId,
            roundId,
            parsed.data.answer
        );

        return NextResponse.json({
            ...result,
            success: result?.correct === true
        });

    } catch (err: any) {

        console.error("SUBMISSION_ERROR:", err.message);

        return NextResponse.json(
            { success: false, error: err.message },
            { status: 400 }
        );
    }
}
