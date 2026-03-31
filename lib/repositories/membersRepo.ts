import { pool } from "@/lib/db";

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
