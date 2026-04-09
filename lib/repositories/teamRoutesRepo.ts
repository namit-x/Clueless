import { pool } from "@/lib/db";
import { getCached, setCached } from "@/lib/gameCache";

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

export async function assignLateTeamRouteRepo(teamId: string): Promise<string> {
    // Pick the route with the fewest teams assigned (distributes load evenly)
    const pickQuery = `
        SELECT r.id
        FROM routes r
        LEFT JOIN team_routes tr ON tr.route_id = r.id
        GROUP BY r.id
        ORDER BY COUNT(tr.team_id) ASC, r.name ASC
        LIMIT 1
    `;
    const pickResult = await pool.query(pickQuery);
    if (!pickResult.rowCount || pickResult.rowCount === 0) {
        throw new Error("NO_ROUTES_AVAILABLE");
    }
    const routeId = pickResult.rows[0].id;

    await pool.query(
        `INSERT INTO team_routes (team_id, route_id) VALUES ($1, $2) ON CONFLICT (team_id) DO NOTHING`,
        [teamId, routeId]
    );

    return routeId;
}

export async function getTeamRouteRepo(teamId: string) {

    // Check cache first (routes are immutable during gameplay)
    const cacheKey = `team_route:${teamId}`;
    const cached = getCached<string>(cacheKey);
    if (cached) {
        return cached;
    }

    const query = `
    SELECT route_id
    FROM team_routes
    WHERE team_id = $1
  `;

    const result = await pool.query(query, [teamId]);

    if (result.rowCount === 0) {
        throw new Error("TEAM_ROUTE_NOT_FOUND");
    }

    const routeId = result.rows[0].route_id;

    // Cache for 10 seconds (team routes don't change during active gameplay)
    setCached(cacheKey, routeId);

    return routeId;
}