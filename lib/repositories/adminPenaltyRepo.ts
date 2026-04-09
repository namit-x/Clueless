import { pool } from "@/lib/db";

export type PenaltyOperation = "INCREMENT" | "DECREMENT";

type AdjustPenaltyWithAuditRepoParams = {
    teamGameResultId: string;
    delta: number;
    reason: string;
    adminId: string;
};

type AdjustPenaltyWithAuditRepoResult = {
    teamGameResultId: string;
    oldPenalty: number;
    newPenalty: number;
};

type PenaltyHistoryEntry = {
    id: string;
    teamGameResultId: string;
    adminId: string;
    operation: string;
    oldPenalty: number;
    newPenalty: number;
    delta: number;
    reason: string;
    createdAt: string;
};

type TeamGameResultPenaltyRow = {
    id: string;
    team_id: string;
    game_id: string;
    penalty_seconds: number | null;
};

type PenaltyAuditLogRow = {
    id: string;
    team_game_result_id: string;
    admin_id: string;
    operation: string;
    old_penalty: number;
    new_penalty: number;
    delta: number;
    reason: string;
    created_at: Date | string;
};

function assertValidDelta(delta: number) {
    if (!Number.isInteger(delta) || delta === 0) {
        throw new Error("INVALID_PENALTY_DELTA");
    }
}

function toPenaltyHistoryEntry(row: PenaltyAuditLogRow): PenaltyHistoryEntry {
    return {
        id: row.id,
        teamGameResultId: row.team_game_result_id,
        adminId: row.admin_id,
        operation: row.operation,
        oldPenalty: row.old_penalty,
        newPenalty: row.new_penalty,
        delta: row.delta,
        reason: row.reason,
        createdAt: new Date(row.created_at).toISOString(),
    };
}

export async function adjustPenaltyWithAuditRepo({
    teamGameResultId,
    delta,
    reason,
    adminId,
}: AdjustPenaltyWithAuditRepoParams): Promise<AdjustPenaltyWithAuditRepoResult> {
    assertValidDelta(delta);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const currentPenaltyResult = await client.query<TeamGameResultPenaltyRow>(
            `SELECT
                id,
                team_id,
                game_id,
                penalty_seconds
             FROM team_game_results
             WHERE id = $1
             FOR UPDATE`,
            [teamGameResultId]
        );

        const teamGameResult = currentPenaltyResult.rows[0];

        if (!teamGameResult) {
            throw new Error("TEAM_GAME_RESULT_NOT_FOUND");
        }

        const MAX_TOTAL_PENALTY_SECONDS = 7200;
        const oldPenalty = teamGameResult.penalty_seconds ?? 0;
        const rawNewPenalty = oldPenalty + delta;

        if (rawNewPenalty > MAX_TOTAL_PENALTY_SECONDS) {
            throw new Error("PENALTY_CAP_EXCEEDED");
        }

        const newPenalty = Math.max(0, rawNewPenalty);
        const operation: PenaltyOperation = delta > 0 ? "INCREMENT" : "DECREMENT";

        await client.query(
            `UPDATE team_game_results
             SET penalty_seconds = $2
             WHERE id = $1`,
            [teamGameResultId, newPenalty]
        );

        await client.query(
            `INSERT INTO admin_penalty_audit_logs (
                team_game_result_id,
                team_id,
                game_id,
                admin_id,
                old_penalty,
                new_penalty,
                operation,
                reason
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                teamGameResultId,
                teamGameResult.team_id,
                teamGameResult.game_id,
                adminId,
                oldPenalty,
                newPenalty,
                operation,
                reason,
            ]
        );

        await client.query("COMMIT");

        return {
            teamGameResultId,
            oldPenalty,
            newPenalty,
        };
    } catch (error) {
        await client.query("ROLLBACK");

        if (error instanceof Error && error.message === "TEAM_GAME_RESULT_NOT_FOUND") {
            throw error;
        }

        throw new Error(`DB_ADJUST_PENALTY_FAILED: ${(error as Error).message}`);
    } finally {
        client.release();
    }
}

export async function getPenaltyHistoryRepo(teamGameResultId: string): Promise<PenaltyHistoryEntry[]> {
    const result = await pool.query<PenaltyAuditLogRow>(
        `SELECT
            id,
            team_game_result_id,
            admin_id,
            operation,
            old_penalty,
            new_penalty,
            (new_penalty - old_penalty) AS delta,
            reason,
            created_at
         FROM admin_penalty_audit_logs
         WHERE team_game_result_id = $1
         ORDER BY created_at DESC`,
        [teamGameResultId]
    );

    return result.rows.map(toPenaltyHistoryEntry);
}
