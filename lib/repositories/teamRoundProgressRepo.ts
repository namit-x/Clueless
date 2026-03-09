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