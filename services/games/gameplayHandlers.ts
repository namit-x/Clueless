import { getBlindCodeRound, startBlindCodeForTeam, submitBlindCodeAnswer } from "./blindCodeService";
import { getTreasureHuntRound, startTreasureHuntForTeam, submitTreasureHuntAnswer } from "./treasureHuntService";

export const teamStartHandlers: Record<string, (teamId: string) => Promise<any>> = {
    "Treasure Hunt": startTreasureHuntForTeam,
    "Blind Code": startBlindCodeForTeam,
};

export const currentRoundHandlers: Record<string, (teamId: string) => Promise<any>> = {
    "Treasure Hunt": getTreasureHuntRound,
    "Blind Code": getBlindCodeRound,
};

export const submissionHandlers: Record<
    string,
    (teamId: string, roundId: string, answer: string, roundContext: any) => Promise<any>
> = {
    "Treasure Hunt": (teamId, roundId, answer, roundContext) =>
        submitTreasureHuntAnswer(teamId, roundId, answer, roundContext.roundNumber),
    "Blind Code": (teamId, roundId, answer, roundContext) =>
        submitBlindCodeAnswer(
            teamId,
            roundId,
            answer,
            roundContext.configuration,
            roundContext.roundNumber
        ),
};
