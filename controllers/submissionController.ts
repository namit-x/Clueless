import { submitAnswerService } from "@/services/submissionService";

export async function submitAnswerController(
    teamId: string,
    roundId: string,
    answer: string
) {

    try {

        return await submitAnswerService(teamId, roundId, answer);

    } catch (error: any) {

        throw new Error(`CONTROLLER_SUBMISSION_FAILED: ${error.message}`);

    }
}