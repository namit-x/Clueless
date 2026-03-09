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

export async function approveTeamRepo(teamId: string) {
  const query = `
    UPDATE teams
    SET is_approved = true
    WHERE team_id = $1
    RETURNING team_id, team_name, is_approved;
  `;

  try {
    const result = await pool.query(query, [teamId]);

    if (result.rowCount === 0) {
      throw new Error("TEAM_NOT_FOUND");
    }

    return result.rows[0];
  } catch (error: any) {
    throw new Error(`DB_TEAM_APPROVAL_FAILED: ${error.message}`);
  }
}