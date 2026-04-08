import { getRoundContextRepo } from "@/lib/repositories/roundsRepo";
import { getRoundAttemptStatusRepo } from "@/lib/repositories/teamRoundProgressRepo";
import { submissionHandlers } from "./games/gameplayHandlers";

// ─── Global rate limiter (per team, all games) ──────────────────────────────
const RATE_LIMIT_MS = 2000;
const lastSubmissionTime = new Map<string, number>();
const shouldLogSubmissionMeta = process.env.NODE_ENV !== "production";

function enforceRateLimit(teamId: string): void {
    const now = Date.now();
    const last = lastSubmissionTime.get(teamId);

    if (last && now - last < RATE_LIMIT_MS) {
        throw new Error("RATE_LIMITED: too many submissions, wait a few seconds");
    }

    lastSubmissionTime.set(teamId, now);
}

// Cleanup stale entries every 60 seconds
setInterval(() => {
    const cutoff = Date.now() - RATE_LIMIT_MS * 2;
    for (const [key, time] of lastSubmissionTime.entries()) {
        if (time < cutoff) lastSubmissionTime.delete(key);
    }
}, 60000);

export async function submitAnswerService(
    teamId: string,
    roundId: string,
    answer: string
) {

    enforceRateLimit(teamId);
    if (shouldLogSubmissionMeta) {
        console.log(
            `[SubmissionService] Received submission: teamId=${teamId}, roundId=${roundId}, answerLength=${answer.length}`
        );
    }

    // Verify the team owns this round and it is currently active
    let roundProgress;
    try {
        roundProgress = await getRoundAttemptStatusRepo(teamId, roundId);
    } catch {
        throw new Error("ROUND_NOT_FOUND_FOR_TEAM");
    }
    if (roundProgress.status !== "ACTIVE") {
        throw new Error("ROUND_NOT_ACTIVE_FOR_TEAM");
    }

    const roundContext = await getRoundContextRepo(roundId);
    const handler = submissionHandlers[roundContext.gameName];

    if (!handler) {
        throw new Error(`UNKNOWN_GAME_TYPE: ${roundContext.gameName}`);
    }

    return await handler(teamId, roundId, answer, roundContext);
}
