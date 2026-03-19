import { submitAnswerService } from "@/services/submissionService";

export async function submitAnswerController(
    teamId: string,
    roundId: string,
    answer: unknown
) {

    if (answer === undefined || answer === null) {
        throw new Error("INVALID_SUBMISSION: answer is missing");
    }

    if (typeof answer !== "string") {
        throw new Error("INVALID_SUBMISSION: answer must be a string");
    }

    try {

        return await submitAnswerService(teamId, roundId, answer);

    } catch (error: any) {

        throw new Error(`CONTROLLER_SUBMISSION_FAILED: ${error.message}`);

    }
}