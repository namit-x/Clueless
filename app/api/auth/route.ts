"use server"
import { pool } from "@/lib/db";

import { TeamData } from "@/app/login/page";

function generateTeamId() {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit ID
}

//Saving Login Info
export async function loginAction(formData: TeamData) {
    // "use server"
    const client = await pool.connect();
    const teamId = generateTeamId();

    try {
        await client.query("BEGIN");

        await client.query(
            "INSERT INTO teams (id, team_name, team_size) VALUES ($1, $2, $3)",
            [teamId, formData.teamName, formData.teamSize]
        );

        for (const m of formData.members) {
            await client.query(
                `INSERT INTO members 
         (team_id, name, mobile, email, branch, is_leader)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [teamId, m.name, m.mobile, m.email, m.branch, m.isLeader]
            );
        }

        await client.query("COMMIT");
    }
    catch (err) {
        console.log(err);
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
    // console.log(formData);
}
