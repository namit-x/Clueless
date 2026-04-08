import { pool } from "@/lib/db";

export async function getLeaderEmailForTeamRepo(teamId: string): Promise<string | null> {
    const result = await pool.query(
        `SELECT email FROM members WHERE team_id = $1 AND is_leader = true LIMIT 1`,
        [teamId]
    );
    return result.rows[0]?.email ?? null;
}

export async function getAllMembersWithTeamsRepo() {
    const query = `
    SELECT
      m.member_id,
      m.name,
      m.email,
      m.mobile,
      m.branch,
      m.is_leader,
      t.team_id,
      t.team_name
    FROM members m
    JOIN teams t ON m.team_id = t.team_id
    ORDER BY t.team_name, m.name;
  `;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error: any) {
        throw new Error(`DB_MEMBERS_FETCH_FAILED: ${error.message}`);
    }
}
