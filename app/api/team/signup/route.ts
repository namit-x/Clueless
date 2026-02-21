import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { teamSignupSchema } from "@/lib/validators/team";
import { TeamSignupInput } from "@/types/team";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ZodError } from "zod";

export async function POST(req: Request) {
    let client;

    try {
        // -------------------------------
        // 1️⃣ Parse JSON safely
        // -------------------------------
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        // -------------------------------
        // 2️⃣ Validate schema
        // -------------------------------
        const parsed = teamSignupSchema.parse(body);
        const data: TeamSignupInput = parsed;

        // -------------------------------
        // 3️⃣ Logical validations
        // -------------------------------
        if (data.members.length !== data.teamSize) {
            return NextResponse.json(
                { error: "Team size does not match number of members" },
                { status: 400 }
            );
        }

        const leaderCount = data.members.filter(m => m.isLeader).length;

        if (leaderCount === 0) {
            return NextResponse.json(
                { error: "No team leader selected" },
                { status: 400 }
            );
        }

        if (leaderCount > 1) {
            return NextResponse.json(
                { error: "Multiple leaders detected. Only one leader allowed." },
                { status: 400 }
            );
        }

        // -------------------------------
        // 4️⃣ Connect DB
        // -------------------------------
        client = await pool.connect();

        // -------------------------------
        // 5️⃣ Check duplicate team name (case-insensitive check)
        // -------------------------------
        const existingTeam = await client.query(
            `SELECT team_id FROM teams WHERE LOWER(team_name) = LOWER($1)`,
            [data.teamName]
        );

        if (existingTeam.rowCount && existingTeam.rowCount > 0) {
            return NextResponse.json(
                { error: "Team name already exists" },
                { status: 409 }
            );
        }

        // -------------------------------
        // 6️⃣ Hash password
        // -------------------------------
        const passwordHash = await bcrypt.hash(data.password, 10);

        const teamId = uuidv4();

        // -------------------------------
        // 7️⃣ Transaction start
        // -------------------------------
        await client.query("BEGIN");

        // Insert team with team name in lowercase
        await client.query(
            `INSERT INTO teams
       (team_id, team_name, password_hash, team_size)
       VALUES ($1, LOWER($2), $3, $4)`,
            [teamId, data.teamName, passwordHash, data.teamSize]
        );

        // Insert members
        for (const m of data.members) {
            const memberId = uuidv4();

            await client.query(
                `INSERT INTO members
        (member_id, team_id, name, mobile, email, branch, is_leader)
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [
                    memberId,
                    teamId,
                    m.name,
                    m.mobile,
                    m.email,
                    m.branch,
                    m.isLeader,
                ]
            );
        }

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            teamId,
        });

    } catch (error: any) {

        // -------------------------------
        // 8️⃣ Safe rollback
        // -------------------------------
        try {
            if (client) await client.query("ROLLBACK");
        } catch { }

        console.error("Signup Error:", error);

        // -------------------------------
        // 9️⃣ Zod validation errors
        // -------------------------------
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.flatten(),
                },
                { status: 400 }
            );
        }

        // -------------------------------
        // 🔟 PostgreSQL errors
        // -------------------------------
        if (error.code) {

            switch (error.code) {

                // UNIQUE violation
                case "23505":
                    return NextResponse.json(
                        { error: "Team name already exists" },
                        { status: 409 }
                    );

                // Foreign key violation
                case "23503":
                    return NextResponse.json(
                        { error: "Database relation error (invalid reference)" },
                        { status: 400 }
                    );

                // NOT NULL violation
                case "23502":
                    return NextResponse.json(
                        { error: `Missing required field: ${error.column}` },
                        { status: 400 }
                    );

                // Invalid text format
                case "22P02":
                    return NextResponse.json(
                        { error: "Invalid data format provided" },
                        { status: 400 }
                    );
            }
        }

        // -------------------------------
        // 1️⃣1️⃣ Fallback error
        // -------------------------------
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 }
        );

    } finally {
        if (client) client.release();
    }
}