import { getBlindCodeRound, startBlindCodeForTeam, submitBlindCodeAnswer } from "./blindCodeService";
import { getTreasureHuntRound, startTreasureHuntForTeam, submitTreasureHuntAnswer } from "./treasureHuntService";
import { getDigitManipulationRound, startDigitManipulationForTeam, submitDigitManipulationAnswer } from "./digitManipulationService";
import { completeTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";

export const teamStartHandlers: Record<string, (teamId: string) => Promise<any>> = {
    "Treasure Hunt": startTreasureHuntForTeam,
    "Blind Code": startBlindCodeForTeam,
    "Digit Manipulation": startDigitManipulationForTeam,
};

export const currentRoundHandlers: Record<string, (teamId: string) => Promise<any>> = {
    "Treasure Hunt": getTreasureHuntRound,
    "Blind Code": getBlindCodeRound,
    "Digit Manipulation": getDigitManipulationRound,
};

export const submissionHandlers: Record<
    string,
    (teamId: string, roundId: string, answer: string, roundContext: any) => Promise<any>
> = {
    "Treasure Hunt": (teamId, roundId, answer, roundContext) =>
        submitTreasureHuntAnswer(teamId, roundId, answer, roundContext.roundNumber, roundContext.gameId),
    "Blind Code": (teamId, roundId, answer, roundContext) =>
        submitBlindCodeAnswer(
            teamId,
            roundId,
            answer,
            roundContext.configuration,
            roundContext.roundNumber
        ),
    "Digit Manipulation": (teamId, roundId, answer, roundContext) =>
        submitDigitManipulationAnswer(
            teamId,
            roundId,
            answer,
            roundContext.configuration,
            roundContext.roundNumber
        ),
};
