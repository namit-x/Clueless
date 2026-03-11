import { pool } from "@/lib/db";

export async function getTeamProgressRepo(teamId: string) {

    const query = `
    SELECT 
      r.round_number,
      trp.status,
      trp.attempt_count,
      trp.started_at,
      trp.completed_at
    FROM team_round_progress trp
    JOIN rounds r ON r.id = trp.round_id
    WHERE trp.team_id = $1
    ORDER BY r.round_number
  `;

    const result = await pool.query(query, [teamId]);

    return result.rows;

}