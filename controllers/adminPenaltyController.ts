import {
    adjustPenaltyService,
    getPenaltyHistoryService,
} from "@/services/adminPenaltyService";

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

export async function getPenaltyHistoryController(teamGameResultId: string) {
    try {
        return await getPenaltyHistoryService(teamGameResultId);
    } catch (error: any) {
        throw new Error(`CONTROLLER_FETCH_PENALTY_HISTORY_FAILED: ${error.message}`);
    }
}
