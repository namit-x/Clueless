import {
    adjustPenaltyWithAuditRepo,
    getPenaltyHistoryRepo,
    type PenaltyOperation,
} from "@/repositories/adminPenaltyRepo";

function assertValidOperation(operation: unknown): asserts operation is PenaltyOperation {
    if (operation !== "INCREMENT" && operation !== "DECREMENT") {
        throw new Error("INVALID_OPERATION");
    }
}

function assertValidValue(value: unknown): asserts value is number {
    if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
        throw new Error("INVALID_PENALTY_VALUE");
    }

    if (value <= 0) {
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

    const delta = operation === "INCREMENT" ? value : -value;

    const result = await adjustPenaltyWithAuditRepo({
        teamGameResultId,
        delta,
        adminId,
        reason: reason.trim(),
    });

    return result;
}

export async function getPenaltyHistoryService(teamGameResultId: string) {
    return await getPenaltyHistoryRepo(teamGameResultId);
}
