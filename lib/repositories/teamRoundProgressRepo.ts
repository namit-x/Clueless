import { pool } from "@/lib/db";

export async function initializeTeamRoundProgressRepo() {

    const query = `
    INSERT INTO team_round_progress (team_id, round_id, status, attempt_count)
    SELECT
      t.team_id,
      r.id,
      'LOCKED',
      0
    FROM teams t
    CROSS JOIN rounds r
    WHERE t.is_approved = true;
  `;

    await pool.query(query);
}

export async function activateFirstRoundRepo(teamId: string) {

  const query = `
    UPDATE team_round_progress
    SET status = 'ACTIVE',
        started_at = NOW()
    WHERE team_id = $1
    AND round_id = (
      SELECT id FROM rounds
      WHERE round_number = 1
      LIMIT 1
    )
    RETURNING round_id;
  `;

  const result = await pool.query(query, [teamId]);

  if (result.rowCount === 0) {
    throw new Error("ROUND_ACTIVATION_FAILED");
  }

  return result.rows[0].round_id;
}