import { getRoundContextRepo } from "@/lib/repositories/roundsRepo";
import { submissionHandlers } from "./games/gameplayHandlers";

// ─── Global rate limiter (per team, all games) ──────────────────────────────
const RATE_LIMIT_MS = 2000;
const lastSubmissionTime = new Map<string, number>();

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

/**
 * Process a team's submission for a round by routing it to the appropriate game handler.
 *
 * May enforce global per-team rate limiting and throw `Error("RATE_LIMITED: too many submissions, wait a few seconds")`
 * if submissions are too frequent. Fetches the round context and dispatches to the handler registered for the round's game.
 *
 * @throws Error("RATE_LIMITED: too many submissions, wait a few seconds") if the team is rate-limited
 * @throws Error("UNKNOWN_GAME_TYPE: <gameName>") if no handler exists for the round's game
 * @returns The value returned by the selected submission handler
 */
export async function submitAnswerService(
    teamId: string,
    roundId: string,
    answer: string
) {

    enforceRateLimit(teamId);
    console.log(`submission reached service: teamId=${teamId}, roundId=${roundId}, answer=${answer}`);

    const roundContext = await getRoundContextRepo(roundId);
    const handler = submissionHandlers[roundContext.gameName];

    if (!handler) {
        throw new Error(`UNKNOWN_GAME_TYPE: ${roundContext.gameName}`);
    }

    return await handler(teamId, roundId, answer, roundContext);
}
