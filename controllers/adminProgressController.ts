import { getAllTeamsProgressService } from "@/services/adminProgressService";

export async function getAllTeamsProgressController() {
    try {
        const teams = await getAllTeamsProgressService();

        return teams;
    } catch (error: any) {
        throw new Error(`CONTROLLER_FETCH_TEAMS_PROGRESS_FAILED: ${error.message}`);
    }
}
