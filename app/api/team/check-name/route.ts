// FOR LIVE TEAM NAME VALIDATION



import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
    teamName: z.string().min(3).max(50),
});

export async function POST(req: Request) {
    let client;

    try {
        const body = await req.json();
        const { teamName } = schema.parse(body);

        client = await pool.connect();

        // Case-insensitive check (important)
        const result = await client.query(
            `SELECT 1 FROM teams WHERE LOWER(team_name) = LOWER($1) LIMIT 1`,
            [teamName.trim()]
        );

        const available = result.rowCount === 0;

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
    } finally {
        if (client) client.release();
    }
}