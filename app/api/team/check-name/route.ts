import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
    teamName: z.string().min(3).max(50),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { teamName } = schema.parse(body);

        const { data, error } = await supabaseAdmin
            .from("teams")
            .select("team_id")
            .ilike("teamName", teamName.trim()) // case-insensitive
            .limit(1);

        if (error) throw error;

        const available = data.length === 0;

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