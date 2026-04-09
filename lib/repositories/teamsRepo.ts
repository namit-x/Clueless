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

export async function rejectTeamRepo(teamId: string) {
  const query = `
    UPDATE teams
    SET is_approved = false
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
    throw new Error(`DB_TEAM_REJECT_FAILED: ${error.message}`);
  }
}

export async function getTeamForLoginRepo(teamName: string) {
    const result = await pool.query(
        `SELECT team_id, team_name, owner_id FROM teams WHERE team_name = $1 LIMIT 1`,
        [teamName]
    );
    return result.rows[0] ?? null;
}

export async function isTeamApprovedRepo(teamId: string): Promise<boolean> {
    const result = await pool.query(
        `SELECT is_approved FROM teams WHERE team_id = $1 LIMIT 1`,
        [teamId]
    );
    return result.rows[0]?.is_approved === true;
}

export async function checkTeamNameRepo(teamName: string): Promise<boolean> {
    const result = await pool.query(
        `SELECT 1 FROM teams WHERE LOWER(team_name) = LOWER($1) LIMIT 1`,
        [teamName.trim()]
    );
    return result.rowCount === 0; // true = available
}

type NewMember = {
    name: string;
    mobile: string;
    email: string;
    branch: string;
    isLeader: boolean;
};

export async function createTeamWithMembersRepo(
    teamName: string,
    teamSize: number,
    ownerId: string,
    members: NewMember[]
): Promise<{ team_id: string; team_name: string }> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const teamResult = await client.query(
            `INSERT INTO teams (team_name, team_size, owner_id, is_approved) VALUES ($1, $2, $3, true) RETURNING team_id, team_name`,
            [teamName, teamSize, ownerId]
        );
        const team = teamResult.rows[0];

        for (const m of members) {
            await client.query(
                `INSERT INTO members (team_id, name, mobile, email, branch, is_leader, role) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [team.team_id, m.name.trim(), m.mobile.trim(), m.email.trim().toLowerCase(), m.branch.trim(), m.isLeader, m.isLeader ? "leader" : "user"]
            );
        }

        await client.query("COMMIT");
        return team;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function getApprovedTeamsRepo() {
  const query = `
    SELECT team_id
    FROM teams
    WHERE is_approved = true
    ORDER BY team_id;
  `;

  const result = await pool.query(query);

  return result.rows;
}