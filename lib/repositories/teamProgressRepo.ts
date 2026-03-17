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

export async function getAllTeamsProgressRepo() {
  const query = `
    SELECT 
      t.team_id,
      t.team_name,
      r.round_number,
      trp.status,
      trp.attempt_count,
      trp.started_at,
      trp.completed_at
    FROM teams t
    LEFT JOIN team_round_progress trp ON t.team_id = trp.team_id
    LEFT JOIN rounds r ON r.id = trp.round_id
    WHERE t.is_approved = true
    ORDER BY t.team_name, r.round_number
  `;

  const result = await pool.query(query);

  return result.rows;
}