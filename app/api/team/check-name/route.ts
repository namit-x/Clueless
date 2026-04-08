import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkTeamNameRepo } from "@/lib/repositories/teamsRepo";
import { rateLimit } from "@/lib/rateLimit";

const schema = z.object({
    teamName: z.string().min(3).max(50),
});

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const { allowed, retryAfterMs } = rateLimit(`check-name:${ip}`, 10, 60 * 1000);
        if (!allowed) {
            return NextResponse.json(
                { available: false, error: "Too many requests." },
                {
                    status: 429,
                    headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
                }
            );
        }

        const body = await req.json();
        const { teamName } = schema.parse(body);

        const available = await checkTeamNameRepo(teamName);

        return NextResponse.json({
            available,
            message: available
                ? "Team name available"
                : "Team name already taken",
        });

    } catch (error: any) {
        console.error("Name check error:", error);

        return NextResponse.json(
            {
                available: false,
                error: "Validation failed",
            },
            { status: 400 }
        );
    }
}
