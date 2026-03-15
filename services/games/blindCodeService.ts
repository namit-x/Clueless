import { initializeTeamRoundProgressRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";

export async function startBlindCodeGame(gameId: string) {

    await initializeTeamRoundProgressRepo(gameId);

    return activateGameRepo(gameId);
}