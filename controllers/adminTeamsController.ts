import { fetchAllTeamsService } from "@/services/adminTeamsService";

export async function getAllTeamsController() {
    try {
        const teams = await fetchAllTeamsService();

        return teams;
    } catch (error: any) {
        throw new Error(`CONTROLLER_FETCH_TEAMS_FAILED: ${error.message}`);
    }
}

import { approveTeamService } from "@/services/adminTeamsService";

export async function approveTeamController(teamId: string) {
    try {
        const team = await approveTeamService(teamId);

        return team;

    } catch (error: any) {
        throw new Error(`CONTROLLER_TEAM_APPROVAL_FAILED: ${error.message}`);
    }
}