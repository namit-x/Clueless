import { getRoundNumberRepo } from "@/lib/repositories/roundsRepo";
import { getCorrectAnswerRepo } from "@/lib/repositories/routeLocationsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";
import { activateNextRoundRepo, completeRoundRepo, decreaseAttemptRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { getTeamRouteRepo } from "@/lib/repositories/teamRoutesRepo";

export async function submitAnswerService(
    teamId: string,
    roundId: string,
    answer: string
) {

    const routeId = await getTeamRouteRepo(teamId);

    const roundNumber = await getRoundNumberRepo(roundId);

    const correctAnswer = await getCorrectAnswerRepo(routeId, roundNumber);

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

