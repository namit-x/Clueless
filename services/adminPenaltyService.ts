import {
    adjustPenaltyWithAuditRepo,
    getPenaltyHistoryRepo,
    type PenaltyOperation,
} from "@/lib/repositories/teamGameResultsRepo";

const MAX_PENALTY_SECONDS = 86400;

function assertValidOperation(operation: unknown): asserts operation is PenaltyOperation {
    if (operation !== "SET" && operation !== "INCREMENT") {
        throw new Error("INVALID_OPERATION");
    }
}

function assertValidValue(value: unknown): asserts value is number {
    if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
        throw new Error("INVALID_PENALTY_VALUE");
    }

    if (value < 0) {
        throw new Error("INVALID_PENALTY_VALUE");
    }
}

function assertValidReason(reason: unknown): asserts reason is string {
    if (typeof reason !== "string" || reason.trim().length === 0) {
        throw new Error("REASON_REQUIRED");
    }
}

export async function adjustPenaltyService(
    teamGameResultId: string,
    operation: unknown,
    value: unknown,
    adminId: string,
    reason: unknown
) {
    assertValidOperation(operation);
    assertValidValue(value);
    assertValidReason(reason);

    const result = await adjustPenaltyWithAuditRepo(
        teamGameResultId,
        operation,
        value,
        adminId,
        reason.trim(),
        MAX_PENALTY_SECONDS
    );

    return result;
}

export async function getPenaltyHistoryService(teamGameResultId: string) {
    return await getPenaltyHistoryRepo(teamGameResultId);
}
