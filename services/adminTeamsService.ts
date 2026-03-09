import { getAllTeamsRepo } from "@/lib/repositories/teamsRepo";

export async function fetchAllTeamsService() {
    try {
        const teams = await getAllTeamsRepo();

        if (!teams) {
            throw new Error("TEAMS_NOT_FOUND");
        }

        return teams;
    } catch (error: any) {
        throw new Error(`SERVICE_FETCH_TEAMS_FAILED: ${error.message}`);
    }
}