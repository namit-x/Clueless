import { getRoundNumberRepo } from "@/lib/repositories/roundsRepo";
import { getClueAndAnswerForRoundRepo } from "@/lib/repositories/routeLocationsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";
import { activateNextRoundRepo, completeRoundRepo, decreaseAttemptRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { getTeamRouteRepo } from "@/lib/repositories/teamRoutesRepo";

export async function submitAnswerService(
    teamId: string,
    roundId: string,
    answer: string
) {

    // Parallelize independent queries: fetching route and round number can happen simultaneously
    const [routeId, roundNumber] = await Promise.all([
        getTeamRouteRepo(teamId),
        getRoundNumberRepo(roundId)
    ]);

    // Fetch clue and answer in a single query instead of two separate queries
    const { correctAnswer } = await getClueAndAnswerForRoundRepo(routeId, roundNumber);

    const isCorrect = correctAnswer === answer.toLowerCase();

    await insertSubmissionRepo(teamId, roundId, answer, isCorrect);

    if (isCorrect) {

        await completeRoundRepo(teamId, roundId);

        await activateNextRoundRepo(teamId, roundNumber);

        return {
            correct: true
        };
    }

    await decreaseAttemptRepo(teamId, roundId);

    return {
        correct: false
    };
}

