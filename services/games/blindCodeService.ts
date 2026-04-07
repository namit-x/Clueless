import {
    activateFirstRoundRepo,
    cleanupActiveRoundsRepo,
    completeGameResultRepo,
    failRoundRepo,
    getCurrentRoundRepo,
    getRoundAttemptStatusRepo,
    initializeTeamRoundProgressRepo,
    refundAttemptRepo,
    submitAndAdvanceRoundRepo,
    submitAndDecrementAttemptRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import { activateGameRepo } from "@/lib/repositories/gameRepo";
import { getRoundContextRepo } from "@/lib/repositories/roundsRepo";
import { insertSubmissionRepo } from "@/lib/repositories/submissionsRepo";
import pLimit from "p-limit";

const JUDGE0_TIMEOUT_MS = 10_000;
const JUDGE0_RETRY = 1;
const judge0Limit = pLimit(5);

// 🔥 retry + limiter wrapper
async function runJudgeSafely(code: string) {
    for (let attempt = 0; attempt <= JUDGE0_RETRY; attempt++) {
        try {
            return await judge0Limit(() => executeJudge0(code));
        } catch (error: any) {
            if (attempt < JUDGE0_RETRY) continue;
            throw error;
        }
    }
}

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

export async function startBlindCodeForTeam(teamId: string, gameId: string) {
    const roundId = await activateFirstRoundRepo(teamId, gameId);
    const { roundNumber, configuration } = await getRoundContextRepo(roundId);


return {
    roundId,
    round: roundNumber,
    challenge: getBlindCodeChallenge(configuration)
};


}

export async function getBlindCodeRound(teamId: string, gameId: string) {
    const roundProgress = await getCurrentRoundRepo(teamId, gameId);

    
if (!roundProgress) {
    return {
        status: "COMPLETED",
        message: "No active round. Game may be completed or not yet started."
    };
}

const { roundId, roundNumber } = roundProgress;
const { configuration } = await getRoundContextRepo(roundId);
const { attemptCount } = await getRoundAttemptStatusRepo(teamId, roundId);

return {
    status: "ACTIVE",
    roundId,
    round: roundNumber,
    challenge: getBlindCodeChallenge(configuration),
    attemptsLeft: Math.max(0, 3 - attemptCount)
};


}

async function executeJudge0(sourceCode: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), JUDGE0_TIMEOUT_MS);

try {
    const response = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language_id: 62,
                source_code: sourceCode
            }),
            signal: controller.signal
        }
    );

    if (!response.ok) {
        throw new Error(`JUDGE0_HTTP_${ response.status } `);
    }

    const result = await response.json();

    if (!result || typeof result !== "object") {
        throw new Error("JUDGE0_INVALID_RESPONSE");
    }

    return result;
} catch (error: any) {
    if (error?.name === "AbortError") {
        throw new Error("JUDGE0_TIMEOUT");
    }
    throw error;
} finally {
    clearTimeout(timeoutId);
}


}

export async function submitBlindCodeAnswer(
    teamId: string,
    roundId: string,
    answer: string,
    configuration: any,
    roundNumber: number,
    gameId: string
) {
    const attempt = await submitAndDecrementAttemptRepo(teamId, roundId, 3);
    if (!attempt) {
        throw new Error("MAX_ATTEMPTS_REACHED");
    }

    
const expectedOutput = getBlindCodeAnswer(configuration).trim();

let judgeResult: any;
try {
    // 🔥 USE SAFE WRAPPER HERE
    judgeResult = await runJudgeSafely(answer);
} catch (error) {
    const refunded = await refundAttemptRepo(teamId, roundId, attempt.attemptCount);
    if (!refunded) {
        throw new Error("JUDGE_EXECUTION_FAILED_WITH_ATTEMPT_CONSUMED");
    }
    throw error;
}

const output = (judgeResult.stdout || "").trim();
const isCorrect = output === expectedOutput;

const evaluation =
    judgeResult.stdout ||
    judgeResult.stderr ||
    judgeResult.compile_output ||
    "NO_OUTPUT";

if (isCorrect) {
    const { advanced } = await submitAndAdvanceRoundRepo(
        teamId, roundId, roundNumber, gameId,
        answer, true, evaluation
    );
    if (!advanced) throw new Error("ROUND_ALREADY_COMPLETED");

    if (roundNumber === 3) {
        await completeGameResultRepo(teamId, gameId, "COMPLETED");
        await cleanupActiveRoundsRepo(teamId);
    }

    return {
        correct: true,
        attemptsLeft: Math.max(0, 3 - attempt.attemptCount),
        data: {
            output: judgeResult.stdout ?? null,
            error: judgeResult.stderr ?? judgeResult.compile_output ?? null
        }
    };
}

await insertSubmissionRepo(teamId, roundId, answer, false, evaluation);

const attemptsExhausted = attempt.attemptCount >= 3;

if (attemptsExhausted) {
    const failed = await failRoundRepo(teamId, roundId);
    if (!failed) throw new Error("ROUND_NOT_ACTIVE");

    await completeGameResultRepo(teamId, gameId, "FAILED");
    await cleanupActiveRoundsRepo(teamId);
}

return {
    correct: false,
    attemptsLeft: Math.max(0, 3 - attempt.attemptCount),
    data: {
        output: judgeResult.stdout ?? null,
        error: judgeResult.stderr ?? judgeResult.compile_output ?? null
    }
};


}
