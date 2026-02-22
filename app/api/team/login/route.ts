import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { pool } from "@/lib/db";

const loginSchema = z.object({
    teamName: z.string(),
    password: z.string(),
});

export async function POST(req: Request) {
    let client;

    try {
        // ---------- Parse & validate ----------
        const body = await req.json();
        const { teamName, password } = loginSchema.parse(body);

        console.log("LOGIN BODY:", body);

        client = await pool.connect();

        // ---------- Fetch team ----------
        const result = await client.query(
            `SELECT team_id, team_name, password_hash
       FROM teams
       WHERE LOWER(team_name) = LOWER($1)
       LIMIT 1`,
            [teamName.trim()]
        );

        // ❌ Team not found
        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: "Invalid team name or password" },
                { status: 401 }
            );
        }

        const team = result.rows[0];

        // ---------- Password verify ----------
        const validPassword = await bcrypt.compare(
            password,
            team.password_hash
        );

        if (!validPassword) {
            return NextResponse.json(
                { error: "Invalid team name or password" },
                { status: 401 }
            );
        }

        // ---------- Success ----------
        return NextResponse.json({
            success: true,
            message: "Login successful",
            team: {
                id: team.team_id,
                name: team.team_name,
            },
        });

    } catch (error: any) {
        console.error("Login Error:", error);

        // Zod validation error
        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid input data" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 }
        );
    } finally {
        if (client) client.release();
    }
}