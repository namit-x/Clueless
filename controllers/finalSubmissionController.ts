import { submitQuizV2FinalAnswer } from "@/services/games/quizV2Service";

export async function submitFinalAnswerController(
    teamId: string,
    gameId: string,
    answer: unknown
) {

    if (answer === undefined || answer === null) {
        throw new Error("INVALID_SUBMISSION: answer is missing");
    }

    if (typeof answer !== "string") {
        throw new Error("INVALID_SUBMISSION: answer must be a string");
    }

    if (answer.trim().length === 0) {
        throw new Error("INVALID_SUBMISSION: answer is empty");
    }

    return await submitQuizV2FinalAnswer(teamId, gameId, answer);
}
