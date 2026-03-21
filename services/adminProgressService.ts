import { getAllTeamsProgressRepo } from "@/lib/repositories/teamProgressRepo";

export async function getAllTeamsProgressService() {
    try {
        const rawData = await getAllTeamsProgressRepo();

        if (!rawData || rawData.length === 0) {
            return [];
        }

        // Group rounds under each team for frontend consumption
        const teamsMap = new Map<string, any>();

        for (const row of rawData) {
            const teamId = row.team_id;

            if (!teamsMap.has(teamId)) {
                teamsMap.set(teamId, {
                    teamId: row.team_id,
                    teamName: row.team_name,
                    rounds: []
                });
            }

            // Only add round data if the join produced a round row
            if (row.round_number != null) {
                teamsMap.get(teamId).rounds.push({
                    roundNumber: row.round_number,
                    status: row.status,
                    attempts: row.attempt_count,
                    startedAt: row.started_at,
                    completedAt: row.completed_at
                });
            }
        }

        return Array.from(teamsMap.values());
    } catch (error: any) {
        throw new Error(`SERVICE_FETCH_TEAMS_PROGRESS_FAILED: ${error.message}`);
    }
}
