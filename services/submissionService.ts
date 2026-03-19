import { getRoundContextRepo } from "@/lib/repositories/roundsRepo";
import { submissionHandlers } from "./games/gameplayHandlers";

export async function submitAnswerService(
    teamId: string,
    roundId: string,
    answer: string
) {

    const roundContext = await getRoundContextRepo(roundId);
    const handler = submissionHandlers[roundContext.gameName];

    if (!handler) {
        throw new Error(`UNKNOWN_GAME_TYPE: ${roundContext.gameName}`);
    }

    return await handler(teamId, roundId, answer, roundContext);
}
