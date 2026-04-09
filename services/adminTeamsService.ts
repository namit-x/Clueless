import {
    approveTeamRepo,
    getAllTeamsRepo,
    rejectTeamRepo,
} from "@/lib/repositories/teamsRepo";

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

export async function approveTeamService(teamId: string) {
    try {
        const team = await approveTeamRepo(teamId);

        return team;

    } catch (error: any) {
        throw new Error(`SERVICE_TEAM_APPROVAL_FAILED: ${error.message}`);
    }
}

export async function rejectTeamService(teamId: string) {
    try {
        const team = await rejectTeamRepo(teamId);

        return team;

    } catch (error: any) {
        throw new Error(`SERVICE_TEAM_REJECT_FAILED: ${error.message}`);
    }
}
