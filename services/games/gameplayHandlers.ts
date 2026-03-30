import { getBlindCodeRound, startBlindCodeForTeam, submitBlindCodeAnswer } from "./blindCodeService";
import { getTreasureHuntRound, startTreasureHuntForTeam, submitTreasureHuntAnswer } from "./treasureHuntService";
import { getDigitManipulationRound, startDigitManipulationForTeam, submitDigitManipulationAnswer } from "./digitManipulationService";
import { getQuizV2Round, startQuizV2ForTeam, submitQuizV2Answer } from "./quizV2Service";
import { completeTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";

export const teamStartHandlers: Record<string, (teamId: string) => Promise<any>> = {
    "Treasure Hunt": startTreasureHuntForTeam,
    "Blind Code": startBlindCodeForTeam,
    "Digit Manipulation": startDigitManipulationForTeam,
    "Quiz V2": startQuizV2ForTeam,
};

export const currentRoundHandlers: Record<string, (teamId: string) => Promise<any>> = {
    "Treasure Hunt": getTreasureHuntRound,
    "Blind Code": getBlindCodeRound,
    "Digit Manipulation": getDigitManipulationRound,
    "Quiz V2": getQuizV2Round,
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
            roundContext.roundNumber,
            roundContext.gameId
        ),
    "Digit Manipulation": (teamId, roundId, answer, roundContext) =>
        submitDigitManipulationAnswer(
            teamId,
            roundId,
            answer,
            roundContext.configuration,
            roundContext.roundNumber,
            roundContext.gameId
        ),
    "Quiz V2": (teamId, roundId, answer, roundContext) =>
        submitQuizV2Answer(
            teamId,
            roundId,
            answer,
            roundContext.configuration,
            roundContext.roundNumber,
            roundContext.gameId
        ),
};
