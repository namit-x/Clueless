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

export async function getCurrentRoundRepo(teamId: string) {

  const query = `
    SELECT r.id, r.round_number
    FROM team_round_progress trp
    JOIN rounds r ON trp.round_id = r.id
    WHERE trp.team_id = $1
    AND trp.status = 'ACTIVE'
    LIMIT 1
  `;

  const result = await pool.query(query, [teamId]);

  if (result.rowCount === 0) {
    throw new Error("ACTIVE_ROUND_NOT_FOUND");
  }

  return {
    roundId: result.rows[0].id,
    roundNumber: result.rows[0].round_number
  };
}

export async function decreaseAttemptRepo(teamId: string, roundId: string) {

  const query = `
    UPDATE team_round_progress
    SET attempt_count = attempt_count + 1
    WHERE team_id = $1 AND round_id = $2
  `;

  await pool.query(query, [teamId, roundId]);
}

export async function completeRoundRepo(teamId: string, roundId: string) {

  const query = `
    UPDATE team_round_progress
    SET status = 'COMPLETED',
        completed_at = NOW()
    WHERE team_id = $1 AND round_id = $2
  `;

  await pool.query(query, [teamId, roundId]);
}

export async function activateNextRoundRepo(teamId: string, currentRoundNumber: number) {

  const query = `
    UPDATE team_round_progress
    SET status = 'ACTIVE'
    WHERE team_id = $1
    AND round_id = (
      SELECT id
      FROM rounds
      WHERE round_number = $2
      LIMIT 1
    )
  `;

  await pool.query(query, [teamId, currentRoundNumber + 1]);
}