// FOR TRIGGERED TEAM NAME VALIDATION


import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { teamStepOneSchema } from "@/lib/validators/teamStepOne";
import { ZodError } from "zod";

export async function POST(req: Request) {
    let client;

    try {
        // -----------------------------
        // Parse JSON safely
        // -----------------------------
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        // -----------------------------
        // Validate input
        // -----------------------------
        const data = teamStepOneSchema.parse(body);

        client = await pool.connect();

        // -----------------------------
        // Check duplicate team name
        // -----------------------------
        const result = await client.query(
            `SELECT 1 FROM teams WHERE team_name = $1 LIMIT 1`,
            [data.teamName]
        );

        if (result.rowCount && result.rowCount > 0) {
            return NextResponse.json(
                {
                    valid: false,
                    error: "Team name already exists",
                },
                { status: 409 }
            );
        }

        // -----------------------------
        // Success response
        // -----------------------------
        return NextResponse.json({
            valid: true,
            message: "Team name available",
        });

    } catch (error: any) {

        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    valid: false,
                    error: "Validation failed",
                    details: error.flatten(),
                },
                { status: 400 }
            );
        }

        console.error("Team validation error:", error);

        return NextResponse.json(
            {
                valid: false,
                error: "Server validation failed",
            },
            { status: 500 }
        );

    } finally {
        if (client) client.release();
    }
}