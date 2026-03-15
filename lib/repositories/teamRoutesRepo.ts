import { pool } from "@/lib/db";

export async function getAllRoutesRepo() {
    const query = `
    SELECT id
    FROM routes
    ORDER BY name;
  `;

    const result = await pool.query(query);
    return result.rows;
}

export async function insertTeamRoutesRepo(
    mappings: { team_id: string; route_id: string }[]
) {

    if (mappings.length === 0) {
        throw new Error("NO_ROUTE_MAPPINGS_GENERATED");
    }

    const query = `
    INSERT INTO team_routes (team_id, route_id)
    VALUES ${mappings.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(",")}
    ON CONFLICT (team_id) DO NOTHING;
  `;

    const params = mappings.flatMap(m => [m.team_id, m.route_id]);

    try {
        await pool.query(query, params);
    } catch (error: any) {
        throw new Error(`DB_INSERT_TEAM_ROUTES_FAILED: ${error.message}`);
    }
}

export async function getTeamRouteRepo(teamId: string) {

    const query = `
    SELECT route_id
    FROM team_routes
    WHERE team_id = $1
  `;

    const result = await pool.query(query, [teamId]);

    if (result.rowCount === 0) {
        throw new Error("TEAM_ROUTE_NOT_FOUND");
    }

    return result.rows[0].route_id;
}