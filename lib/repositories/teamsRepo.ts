import { pool } from "@/lib/db";

export async function getAllTeamsRepo() {
    const query = `
    SELECT
      team_id,
      team_name,
      team_size,
      COALESCE(is_approved, false) AS is_approved
    FROM teams
    ORDER BY team_name;
  `;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error: any) {
        throw new Error(`DB_TEAMS_FETCH_FAILED: ${error.message}`);
    }
}