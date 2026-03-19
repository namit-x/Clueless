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

    return await activateGameRepo(gameId);
}

function getBlindCodeChallenge(configuration: any) {

    if (typeof configuration?.expected_output !== "string" || configuration.expected_output.length === 0) {
        throw new Error("BLIND_CODE_CHALLENGE_NOT_FOUND");
    }

    return configuration.expected_output;
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

async function executeJudge0(sourceCode: string) {

    const response = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                language_id: 62, // Java
                source_code: sourceCode
            })
        }
    );

    return response.json();
}

export async function submitBlindCodeAnswer(
    teamId: string,
    roundId: string,
    answer: string,          // this now contains Java code
    configuration: any,
    roundNumber: number
) {

    const expectedOutput = getBlindCodeAnswer(configuration).trim();

    const judgeResult = await executeJudge0(answer);

    const output = (judgeResult.stdout || "").trim();

    const isCorrect = output === expectedOutput;

    const evaluation =
        judgeResult.stdout ||
        judgeResult.stderr ||
        judgeResult.compile_output ||
        "NO_OUTPUT";

    await insertSubmissionRepo(
        teamId,
        roundId,
        answer,
        isCorrect,
        evaluation
    );

    if (isCorrect) {

        await completeRoundRepo(teamId, roundId);
        await activateNextRoundRepo(teamId, roundNumber);

        return { correct: true };
    }

    await decreaseAttemptRepo(teamId, roundId);

    return { correct: false };
}