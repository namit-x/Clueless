import { fetchAllTeamsService } from "@/services/adminTeamsService";

export async function getAllTeamsController() {
    try {
        const teams = await fetchAllTeamsService();

        return teams;
    } catch (error: any) {
        throw new Error(`CONTROLLER_FETCH_TEAMS_FAILED: ${error.message}`);
    }
}