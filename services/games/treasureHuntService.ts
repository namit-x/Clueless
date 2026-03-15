import { getApprovedTeamsRepo } from "@/lib/repositories/teamsRepo";
import { getAllRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import { insertTeamRoutesRepo } from "@/lib/repositories/teamRoutesRepo";
import { initializeTeamRoundProgressRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";

export async function startTreasureHuntGame(gameId: string) {

    const teams = await getApprovedTeamsRepo();
    const routes = await getAllRoutesRepo();

    if (routes.length < teams.length) {
        throw new Error("INSUFFICIENT_ROUTES");
    }

    const mappings = teams.map((team: any, i: number) => ({
        team_id: team.team_id,
        route_id: routes[i].id
    }));

    await insertTeamRoutesRepo(mappings);

    await initializeTeamRoundProgressRepo(gameId);

    return activateGameRepo(gameId);
}