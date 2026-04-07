import {
    adjustPenaltyService,
    getPenaltyHistoryService,
} from "@/services/adminPenaltyService";

/**
 * Adjusts a penalty for a specific team game result using the provided operation, value, and optional reason.
 *
 * @param teamGameResultId - Identifier of the team game result to modify
 * @param payload - Adjustment details
 * @param payload.operation - The adjustment operation to apply (for example, an operation type or code)
 * @param payload.value - The value to apply with the operation (for example, amount or delta)
 * @param payload.reason - Optional textual reason for the adjustment
 * @param adminId - Identifier of the administrator performing the adjustment
 * @returns An object describing the outcome of the penalty adjustment
 * @throws Error - If the adjustment fails; error message is prefixed with `CONTROLLER_ADJUST_PENALTY_FAILED: `
 */
export async function adjustPenaltyController(
    teamGameResultId: string,
    payload: {
        operation?: unknown;
        value?: unknown;
        reason?: unknown;
    },
    adminId: string
) {
    try {
        return await adjustPenaltyService(
            teamGameResultId,
            payload.operation,
            payload.value,
            adminId,
            payload.reason
        );
    } catch (error: any) {
        throw new Error(`CONTROLLER_ADJUST_PENALTY_FAILED: ${error.message}`);
    }
}

/**
 * Retrieve the penalty history for a specific team game result.
 *
 * @param teamGameResultId - The identifier of the team game result whose penalty history should be fetched
 * @returns The penalty history associated with the specified team game result
 * @throws Error with message prefixed by `CONTROLLER_FETCH_PENALTY_HISTORY_FAILED:` when retrieval fails
 */
export async function getPenaltyHistoryController(teamGameResultId: string) {
    try {
        return await getPenaltyHistoryService(teamGameResultId);
    } catch (error: any) {
        throw new Error(`CONTROLLER_FETCH_PENALTY_HISTORY_FAILED: ${error.message}`);
    }
}
