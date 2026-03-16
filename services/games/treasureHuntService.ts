import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import { insertTeamRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import { initializeTeamRoundProgressRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";

export async function startTreasureHuntGame(gameId: string) {

    // Parallelize independent fetches: teams and routes can be fetched simultaneously
    const [teams, routes] = await Promise.all([
        getApprovedTeamsRepo(),
        getAllRoutesRepo()
    ]);

    if (routes.length < teams.length) {
        throw new Error("INSUFFICIENT_ROUTES");
    }

    const mappings = teams.map((team: any, i: number) => ({
        team_id: team.team_id,
        route_id: routes[i].id
    }));

    // Parallelize route insertion and round progress initialization
    await Promise.all([
        insertTeamRoutesRepo(mappings),
        initializeTeamRoundProgressRepo(gameId)
    ]);

    return activateGameRepo(gameId);
}