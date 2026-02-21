import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { teamSignupSchema } from "@/lib/validators/team";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    const client = await pool.connect();

    try {
        const body = await req.json();

        // ✅ Validate request
        const parsed = teamSignupSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const data = parsed.data;

        // ✅ Backend generates teamId
        const teamId = uuidv4();

        // Logical validations
        if (data.members.length !== data.teamSize) {
            return NextResponse.json(
                { error: "Team size mismatch" },
                { status: 400 }
            );
        }

        const leaderCount = data.members.filter(m => m.isLeader).length;

        if (leaderCount !== 1) {
            return NextResponse.json(
                { error: "Exactly one leader required" },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(data.password, 10);


        await client.query(
            `INSERT INTO teams
     (team_id, team_name, password_hash, team_size)
     VALUES ($1,$2,$3,$4)`,
            [teamId, data.teamName, passwordHash, data.teamSize]
        );

        // ✅ Insert members linked to generated teamId
        for (const member of data.members) {
            const memberId = uuidv4();

            await client.query(
                `INSERT INTO members
       (member_id, team_id, name, mobile, email, branch, is_leader)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [
                    memberId,
                    teamId,
                    member.name,
                    member.mobile,
                    member.email,
                    member.branch,
                    member.isLeader
                ]
            );
        }


        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            teamId, // returned AFTER creation
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}