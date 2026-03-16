import {
    activateFirstRoundRepo,
    activateNextRoundRepo,
    completeRoundRepo,
    decreaseAttemptRepo,
    getCurrentRoundRepo,
    initializeTeamRoundProgressRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";
import { getRoundContextRepo } from "@/lib/repositories/roundsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";

export async function startBlindCodeGame(gameId: string) {

    await initializeTeamRoundProgressRepo(gameId);

    return activateGameRepo(gameId);
}

function getBlindCodeChallenge(configuration: any) {

    if (typeof configuration?.expected_output !== "string" || configuration.expected_output.length === 0) {
        throw new Error("BLIND_CODE_CHALLENGE_NOT_FOUND");
    }

    return configuration.target_string;
}

function getBlindCodeAnswer(configuration: any) {

    if (typeof configuration?.correct_answer === "string" && configuration.correct_answer.length > 0) {
        return configuration.correct_answer;
    }

    return getBlindCodeChallenge(configuration);
}

export async function startBlindCodeForTeam(teamId: string) {

    const roundId = await activateFirstRoundRepo(teamId);
    const { roundNumber, configuration } = await getRoundContextRepo(roundId);

    return {
        roundId,
        round: roundNumber,
        challenge: getBlindCodeChallenge(configuration)
    };
}

export async function getBlindCodeRound(teamId: string) {

    const { roundId, roundNumber } = await getCurrentRoundRepo(teamId);
    const { configuration } = await getRoundContextRepo(roundId);

    return {
        roundId,
        round: roundNumber,
        challenge: getBlindCodeChallenge(configuration)
    };
}

export async function submitBlindCodeAnswer(
    teamId: string,
    roundId: string,
    answer: string,
    configuration: any,
    roundNumber: number
) {

    const expectedAnswer = getBlindCodeAnswer(configuration).toLowerCase();
    const isCorrect = expectedAnswer === answer.toLowerCase();

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
