import { pool } from "@/lib/db";

export async function initializeTeamRoundProgressRepo(gameId: string) {

  const query = `
        INSERT INTO team_round_progress (team_id, round_id, status, attempt_count)
        SELECT
            t.team_id,
            r.id,
            'LOCKED',
            0
        FROM teams t
        CROSS JOIN rounds r
        WHERE
            t.is_approved = true
            AND r.game_id = $1
        ON CONFLICT (team_id, round_id) DO NOTHING
    `;

  const result = await pool.query(query, [gameId]);
}

/**
 * Inserts a locked progress row for the given team for every round that belongs to the specified game.
 *
 * Initializes each inserted row with `status = 'LOCKED'` and `attempt_count = 0`. The operation is idempotent — existing rows for the same team and round are not modified.
 *
 * @param teamId - The ID of the team to initialize progress for
 * @param gameId - The ID of the game whose rounds should be used for initialization
 * @throws Error("NO_ROUNDS_CONFIGURED") if the game has no rounds
 */
export async function initializeTeamRoundProgressForTeamRepo(teamId: string, gameId: string) {

  const roundsResult = await pool.query(
    `SELECT id FROM rounds WHERE game_id = $1`,
    [gameId]
  );

  if (roundsResult.rowCount === 0) {
    throw new Error("NO_ROUNDS_CONFIGURED");
  }

  const query = `
    INSERT INTO team_round_progress (team_id, round_id, status, attempt_count)
    SELECT $1, r.id, 'LOCKED', 0
    FROM rounds r
    WHERE r.game_id = $2
    ON CONFLICT (team_id, round_id) DO NOTHING
  `;

  await pool.query(query, [teamId, gameId]);
}

/**
 * Activate the team's round 1 progress for the specified game.
 *
 * @param teamId - The team's id
 * @param gameId - The game's id
 * @returns The `round_id` of the activated round
 * @throws Error("ROUND_ACTIVATION_FAILED") if round 1 could not be activated or found active
 */
export async function activateFirstRoundRepo(teamId: string, gameId: string) {

  // Try to activate round 1 (LOCKED → ACTIVE)
  const activateQuery = `
    UPDATE team_round_progress trp
    SET status = 'ACTIVE',
        started_at = NOW()
    FROM rounds r
    WHERE trp.round_id = r.id
    AND trp.team_id = $1
    AND trp.status = 'LOCKED'
    AND r.round_number = 1
    AND r.game_id = $2
    RETURNING trp.round_id;
  `;

  const result = await pool.query(activateQuery, [teamId, gameId]);

  if (result.rowCount && result.rowCount > 0) {
    return result.rows[0].round_id;
  }

  // Round 1 may already be ACTIVE (idempotent retry) — return it
  const fallbackQuery = `
    SELECT trp.round_id
    FROM team_round_progress trp
    JOIN rounds r ON trp.round_id = r.id
    WHERE trp.team_id = $1
      AND r.round_number = 1
      AND r.game_id = $2
      AND trp.status = 'ACTIVE'
  `;

  const fallback = await pool.query(fallbackQuery, [teamId, gameId]);

  if (fallback.rowCount === 0) {
    throw new Error("ROUND_ACTIVATION_FAILED");
  }

  return fallback.rows[0].round_id;
}

/**
 * Fetches the currently active round for a team within a game.
 *
 * @returns `{ roundId, roundNumber }` for the active round, or `null` if the team has no active round in the specified game
 */
export async function getCurrentRoundRepo(teamId: string, gameId: string) {

  const query = `
    SELECT r.id, r.round_number
    FROM team_round_progress trp
    JOIN rounds r ON trp.round_id = r.id
    WHERE trp.team_id = $1
    AND r.game_id = $2
    AND trp.status = 'ACTIVE'
    LIMIT 1
  `;

  const result = await pool.query(query, [teamId, gameId]);

  if (result.rowCount === 0) {
    return null;
  }

  return {
    roundId: result.rows[0].id,
    roundNumber: result.rows[0].round_number
  };
}

/**
 * Retrieves one round for the team in the specified game that is either ACTIVE or FAILED.
 *
 * @returns An object with `{ roundId, roundNumber, status, attemptCount }` when a matching row exists, or `null` if none.
 * - `roundId` — the round's id
 * - `roundNumber` — the round's numeric order within the game
 * - `status` — the progress status (`'ACTIVE'` or `'FAILED'`)
 * - `attemptCount` — the number of attempts consumed for the round
 */
export async function getActiveOrFailedRoundRepo(teamId: string, gameId: string) {

  const query = `
    SELECT r.id, r.round_number, trp.status, trp.attempt_count
    FROM team_round_progress trp
    JOIN rounds r ON trp.round_id = r.id
    WHERE trp.team_id = $1
      AND r.game_id = $2
      AND trp.status IN ('ACTIVE', 'FAILED')
    LIMIT 1
  `;

  const result = await pool.query(query, [teamId, gameId]);

  if (result.rowCount === 0) {
    return null;
  }

  return {
    roundId: result.rows[0].id as string,
    roundNumber: result.rows[0].round_number as number,
    status: result.rows[0].status as string,
    attemptCount: result.rows[0].attempt_count as number
  };
}

export async function getRoundAttemptStatusRepo(teamId: string, roundId: string) {

  const result = await pool.query(
    `SELECT status, attempt_count
     FROM team_round_progress
     WHERE team_id = $1 AND round_id = $2`,
    [teamId, roundId]
  );

  if (result.rowCount === 0) {
    throw new Error("ROUND_PROGRESS_NOT_FOUND");
  }

  return {
    status: result.rows[0].status as string,
    attemptCount: result.rows[0].attempt_count as number
  };
}

/**
 * Increment the attempt count for an active team round and mark the round as failed when the count reaches 3.
 *
 * @returns The updated attempt count.
 * @throws Error with message "MAX_ATTEMPTS_REACHED" if the round is not active or the maximum attempts have already been reached.
 */
export async function decreaseAttemptRepo(teamId: string, roundId: string): Promise<number> {

  const query = `
    UPDATE team_round_progress
    SET
      attempt_count = attempt_count + 1,
      status = CASE WHEN attempt_count + 1 >= 3 THEN 'FAILED' ELSE status END
    WHERE team_id = $1
      AND round_id = $2
      AND status = 'ACTIVE'
      AND attempt_count < 3
    RETURNING attempt_count
  `;

  const result = await pool.query(query, [teamId, roundId]);

  if (result.rowCount === 0) {
    throw new Error("MAX_ATTEMPTS_REACHED");
  }

  return result.rows[0].attempt_count;
}

/**
 * Decrements the active round's attempt count for a team when the stored attempt count matches the provided value.
 *
 * @param teamId - ID of the team whose progress should be updated
 * @param roundId - ID of the round to refund an attempt for
 * @param consumedAttemptCount - The expected current `attempt_count`; the refund only occurs if the stored `attempt_count` equals this value and is greater than zero
 * @returns `true` if a row was updated (attempt refunded), `false` otherwise
 */
export async function refundAttemptRepo(
  teamId: string,
  roundId: string,
  consumedAttemptCount: number
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE team_round_progress
     SET attempt_count = attempt_count - 1
     WHERE team_id = $1
       AND round_id = $2
       AND status = 'ACTIVE'
       AND attempt_count = $3
       AND attempt_count > 0`,
    [teamId, roundId, consumedAttemptCount]
  );

  return (result.rowCount ?? 0) > 0;
}

/**
 * Mark the specified team's round progress as completed.
 *
 * Updates the `team_round_progress` row for the given `teamId` and `roundId` by setting
 * `status` to `'COMPLETED'` and `completed_at` to the current time. This operation does
 * not check or enforce the row's prior status and does not return a value.
 *
 * @param teamId - The ID of the team whose progress should be completed
 * @param roundId - The ID of the round to mark as completed
 */
export async function completeRoundRepo(teamId: string, roundId: string) {

  const query = `
    UPDATE team_round_progress
    SET status = 'COMPLETED',
        completed_at = NOW()
    WHERE team_id = $1 AND round_id = $2
  `;

  await pool.query(query, [teamId, roundId]);
}

/**
 * Marks the team's active progress for a round as failed and records the failure time.
 *
 * @returns `true` if an ACTIVE progress row was updated to `FAILED`, `false` otherwise.
 */
export async function failRoundRepo(teamId: string, roundId: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE team_round_progress
     SET status = 'FAILED',
         failed_at = NOW()
     WHERE team_id = $1
       AND round_id = $2
       AND status = 'ACTIVE'`,
    [teamId, roundId]
  );

  return (result.rowCount ?? 0) > 0;
}

/**
 * Atomically completes the current round and activates the next one.
 * Uses a transaction with a status guard on the complete step to prevent
 * double-processing from concurrent requests.
 *
 * Returns true if the round was completed, false if it was already completed
 * (idempotent — safe to call twice).
 *
 * For round 3 (the last round), the next-round activation finds no rows and
 * is a no-op. The caller is responsible for recording game completion in
 * that case.
 */
export async function completeAndAdvanceRoundRepo(
  teamId: string,
  roundId: string,
  roundNumber: number,
  gameId: string
): Promise<boolean> {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const completeResult = await client.query(
      `UPDATE team_round_progress
       SET status = 'COMPLETED', completed_at = NOW()
       WHERE team_id = $1
         AND round_id = $2
         AND status = 'ACTIVE'`,
      [teamId, roundId]
    );

    if (completeResult.rowCount === 0) {
      // Round was already completed by a concurrent request — safe no-op
      await client.query("ROLLBACK");
      return false;
    }

    await client.query(
      `UPDATE team_round_progress
       SET status = 'ACTIVE', started_at = NOW()
       WHERE team_id = $1
         AND round_id = (
           SELECT id FROM rounds
           WHERE game_id = $2
             AND round_number = $3
           LIMIT 1
         )`,
      [teamId, gameId, roundNumber + 1]
    );

    await client.query("COMMIT");
    return true;

  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Activates the next round for a team in a specific game by setting its status to `ACTIVE` and recording the start time.
 *
 * This targets the round whose `round_number` is `roundNumber + 1` for the given `gameId`; if no such round exists the update is a no-op.
 *
 * @param teamId - The team identifier
 * @param roundNumber - The current round number; the function activates the subsequent round (`roundNumber + 1`)
 * @param gameId - The game identifier used to scope the next round lookup
 */
export async function activateNextRoundRepo(teamId: string, roundNumber: number, gameId: string) {

  const updateQuery = `
    UPDATE team_round_progress
    SET status = 'ACTIVE',
        started_at = NOW()
    WHERE team_id = $1
    AND round_id = (
      SELECT id
      FROM rounds
      WHERE game_id = $2
      AND round_number = $3
      LIMIT 1
    )
  `;

  await pool.query(updateQuery, [teamId, gameId, roundNumber + 1]);
}

/**
 * Atomically marks the specified active round as `FAILED` for a team and attempts to activate the next round.
 *
 * @param teamId - The team's id
 * @param roundId - The id of the round to mark as failed
 * @param roundNumber - The numeric position of the current round; the function activates the round with `round_number = roundNumber + 1`
 * @param gameId - The game id used to scope selection of the next round
 * @returns `true` if the current round was transitioned from `ACTIVE` to `FAILED` and the transaction committed, `false` if the current round was not `ACTIVE` (no changes were made)
 */
export async function failAndAdvanceRoundRepo(
  teamId: string,
  roundId: string,
  roundNumber: number,
  gameId: string
): Promise<boolean> {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const failResult = await client.query(
      `UPDATE team_round_progress
       SET status = 'FAILED', failed_at = NOW()
       WHERE team_id = $1
         AND round_id = $2
         AND status = 'ACTIVE'`,
      [teamId, roundId]
    );

    if (failResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return false;
    }

    await client.query(
      `UPDATE team_round_progress
       SET status = 'ACTIVE', started_at = NOW()
       WHERE team_id = $1
         AND round_id = (
           SELECT id FROM rounds
           WHERE game_id = $2
             AND round_number = $3
           LIMIT 1
         )`,
      [teamId, gameId, roundNumber + 1]
    );

    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Record a submission, mark the current round as completed, and activate the next round within a single transaction.
 *
 * If there is no next round, the team's game result is marked completed. If the current round is already no longer `ACTIVE` (e.g., due to a concurrent request), the function rolls back and reports no advancement.
 *
 * @returns An object with `advanced: true` if the round was completed and advancement was attempted, or `advanced: false` if the round was already completed by a concurrent request.
 */
export async function submitAndAdvanceRoundRepo(
  teamId: string,
  roundId: string,
  roundNumber: number,
  gameId: string,
  answer: string,
  isCorrect: boolean,
  evaluationResult: string
): Promise<{ advanced: boolean }> {

  const client = await pool.connect();

  try {
    // console.log('Evaluations result:', { teamId, roundId, roundNumber, gameId, answer, isCorrect, evaluationResult });
    await client.query("BEGIN");

    // 1. Record the submission
    await client.query(
      `INSERT INTO submissions
         (team_id, round_id, submitted_answer, is_correct, evaluation_result, evaluated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [teamId, roundId, answer, isCorrect, evaluationResult]
    );

    // 2. Complete current round (status guard prevents double-completion)
    const completeResult = await client.query(
      `UPDATE team_round_progress
       SET status = 'COMPLETED', completed_at = NOW()
       WHERE team_id = $1
         AND round_id = $2
         AND status = 'ACTIVE'`,
      [teamId, roundId]
    );

    if (completeResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { advanced: false };
    }

    // 3. Activate next round (no-op for last round)
    await client.query(
      `UPDATE team_round_progress
       SET status = 'ACTIVE', started_at = NOW()
       WHERE team_id = $1
         AND round_id = (
           SELECT id FROM rounds
           WHERE game_id = $2
             AND round_number = $3
           LIMIT 1
         )`,
      [teamId, gameId, roundNumber + 1]
    );

    // 4. If last round → mark game completed
    const isLastRound = await client.query(
      `SELECT 1 FROM rounds
   WHERE game_id = $1 AND round_number > $2
   LIMIT 1`,
      [gameId, roundNumber]
    );

    if (isLastRound.rowCount === 0) {
      // no next round → this was last round
      await client.query(
        `UPDATE team_game_results
     SET 
       completed_at = NOW(),
       completion_time = NOW() - started_at
     WHERE team_id = $1 
       AND game_id = $2`,
        [teamId, gameId]
      );
    }

    await client.query("COMMIT");
    return { advanced: true };

  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Increment the attempt count for an active round when the current count is below the allowed maximum.
 *
 * @param maxAttempts - The maximum allowed attempts for the round (default: `3`)
 * @returns `{ attemptCount }` with the updated attempt count, or `null` if the round is not `ACTIVE` or attempts are exhausted
 */
export async function submitAndDecrementAttemptRepo(
  teamId: string,
  roundId: string,
  maxAttempts: number = 3
): Promise<{ attemptCount: number } | null> {

  const result = await pool.query(
    `UPDATE team_round_progress
     SET attempt_count = attempt_count + 1
     WHERE team_id = $1
       AND round_id = $2
       AND status = 'ACTIVE'
       AND attempt_count < $3
     RETURNING attempt_count`,
    [teamId, roundId, maxAttempts]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return { attemptCount: result.rows[0].attempt_count };
}

/**
 * Set a team's final game status and record completion timestamps and time.
 *
 * @param teamId - The team's identifier
 * @param gameId - The game's identifier
 * @param status - Final status to apply (`"COMPLETED"` or `"FAILED"`)
 * @returns The updated row `{ id, status, completed_at, completion_time }` or `null` if no row was updated
 */
export async function completeGameResultRepo(
  teamId: string,
  gameId: string,
  status: "COMPLETED" | "FAILED"
) {
  const result = await pool.query(
    `UPDATE team_game_results
     SET
       status = $3,
       completed_at = NOW(),
       completion_time = EXTRACT(EPOCH FROM (NOW() - started_at)) + COALESCE(penalty_seconds, 0)
     WHERE team_id = $1
       AND game_id = $2
       AND completed_at IS NULL
     RETURNING id, status, completed_at, completion_time`,
    [teamId, gameId, status]
  );

  return result.rows[0] ?? null;
}

/**
 * Marks all currently active rounds for the given team as failed.
 *
 * Updates matching `team_round_progress` rows to set `status` to `'FAILED'` and `failed_at` to the current timestamp.
 *
 * @param teamId - The ID of the team whose active rounds should be marked failed
 */
export async function cleanupActiveRoundsRepo(teamId: string) {
  await pool.query(
    `UPDATE team_round_progress
     SET status = 'FAILED',
         failed_at = NOW()
     WHERE team_id = $1
       AND status = 'ACTIVE'`,
    [teamId]
  );
}

// ─── Quiz V2: metadata + configurable attempt limit ─────────────────────────

/**
 * Atomically sets JSON metadata for multiple team-round progress rows, writing values only when a row's metadata is null or lacks an `ascii_number` key.
 *
 * Executes all updates in a single transaction so either all provided metadata changes are applied or none are.
 *
 * @param updates - Array of updates, each with `teamId`, `roundId`, and a `metadata` object to store as JSONB
 */
export async function bulkSetMetadataRepo(
  updates: Array<{ teamId: string; roundId: string; metadata: object }>
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const u of updates) {
      await client.query(
        `UPDATE team_round_progress
         SET metadata = $3::jsonb
         WHERE team_id = $1
           AND round_id = $2
           AND (
             metadata IS NULL
             OR NOT (metadata ? 'ascii_number')
           )`,
        [u.teamId, u.roundId, JSON.stringify(u.metadata)]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Fetches metadata for a team's round and, when available, returns parsed ASCII metadata.
 *
 * @returns `null` if no progress row exists; the raw `metadata` value when `ascii_number` is missing; otherwise an object `{ ascii_number: number, revealed: boolean }`.
 */
export async function getRoundMetadataRepo(teamId: string, roundId: string) {
  const result = await pool.query(
    `SELECT
       metadata,
       (metadata->>'ascii_number')::int AS ascii_number,
       COALESCE((metadata->>'revealed')::boolean, false) AS revealed
     FROM team_round_progress
     WHERE team_id = $1 AND round_id = $2`,
    [teamId, roundId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  if (result.rows[0].ascii_number === null || result.rows[0].ascii_number === undefined) {
    return result.rows[0]?.metadata ?? null;
  }

  return {
    ascii_number: result.rows[0].ascii_number as number,
    revealed: result.rows[0].revealed as boolean,
  };
}

/**
 * Compute counts of team rounds for a game and how many include an `ascii_number` in their metadata.
 *
 * @returns An object with `total` — the number of team round rows for the given game, and `withAscii` — the count of those rows whose `metadata` contains the `ascii_number` key
 */
export async function getMetadataCoverageRepo(teamId: string, gameId: string) {
  const result = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (
         WHERE trp.metadata IS NOT NULL
           AND trp.metadata ? 'ascii_number'
       ) AS with_ascii
     FROM team_round_progress trp
     JOIN rounds r ON trp.round_id = r.id
     WHERE trp.team_id = $1
       AND r.game_id = $2`,
    [teamId, gameId]
  );

  return {
    total: Number(result.rows[0]?.total ?? 0),
    withAscii: Number(result.rows[0]?.with_ascii ?? 0),
  };
}

/**
 * Marks the round's metadata as revealed for a team's progress.
 *
 * Sets or overwrites the `revealed` key to `true` inside the `metadata` JSONB for the given team and round.
 * If `metadata` is null, an empty object is created before setting `revealed`.
 */
export async function updateMetadataRevealedRepo(teamId: string, roundId: string) {
  await pool.query(
    `UPDATE team_round_progress
     SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{revealed}', 'true')
     WHERE team_id = $1 AND round_id = $2`,
    [teamId, roundId]
  );
}

/**
 * Retrieve revealed ASCII numbers for a team's completed rounds in a game.
 *
 * Only rounds with `metadata` containing `ascii_number` and `metadata.revealed = true` are included; results are ordered by round number.
 *
 * @returns An array of objects each containing `roundNumber` (the round's number) and `asciiNumber` (the revealed ASCII number)
 */
export async function getRevealedNumbersRepo(teamId: string, gameId: string) {
  const result = await pool.query(
    `SELECT
       r.round_number,
       (trp.metadata->>'ascii_number')::int AS ascii_number
     FROM team_round_progress trp
     JOIN rounds r ON trp.round_id = r.id
     WHERE trp.team_id = $1
       AND r.game_id = $2
       AND trp.status = 'COMPLETED'
       AND trp.metadata IS NOT NULL
       AND trp.metadata ? 'ascii_number'
       AND (trp.metadata->>'revealed')::boolean = true
     ORDER BY r.round_number`,
    [teamId, gameId]
  );
  return result.rows.map((r: any) => ({
    roundNumber: r.round_number as number,
    asciiNumber: r.ascii_number as number,
  }));
}

/**
 * Determines whether all rounds for a team in a game are finished (either `COMPLETED` or `FAILED`).
 *
 * @returns `true` if every round for the team in the game has status `COMPLETED` or `FAILED` and there is at least one round, `false` otherwise.
 */
export async function areAllRoundsDoneRepo(teamId: string, gameId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE trp.status IN ('COMPLETED', 'FAILED')) AS done,
       COUNT(*) AS total
     FROM team_round_progress trp
     JOIN rounds r ON trp.round_id = r.id
     WHERE trp.team_id = $1 AND r.game_id = $2`,
    [teamId, gameId]
  );
  const { done, total } = result.rows[0];
  return parseInt(done) === parseInt(total) && parseInt(total) > 0;
}
