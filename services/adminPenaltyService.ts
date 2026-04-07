import {
    adjustPenaltyWithAuditRepo,
    getPenaltyHistoryRepo,
    type PenaltyOperation,
} from "@/lib/repositories/teamGameResultsRepo";

const MAX_PENALTY_SECONDS = 86400;

/**
 * Asserts that the provided operation is a valid penalty operation.
 *
 * @param operation - The value to validate; must be exactly `"SET"` or `"INCREMENT"`.
 * @throws Error("INVALID_OPERATION") if `operation` is not `"SET"` or `"INCREMENT"`.
 */
function assertValidOperation(operation: unknown): asserts operation is PenaltyOperation {
    if (operation !== "SET" && operation !== "INCREMENT") {
        throw new Error("INVALID_OPERATION");
    }
}

/**
 * Ensures the provided value is a finite integer greater than or equal to zero and narrows its type to `number`.
 *
 * @param value - The value to validate as a penalty (seconds)
 * @throws Error("INVALID_PENALTY_VALUE") - If `value` is not a finite integer or is negative
 */
function assertValidValue(value: unknown): asserts value is number {
    if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
        throw new Error("INVALID_PENALTY_VALUE");
    }

    if (value < 0) {
        throw new Error("INVALID_PENALTY_VALUE");
    }
}

/**
 * Asserts that `reason` is a non-empty string containing non-whitespace characters.
 *
 * @param reason - The value to validate as a reason string
 * @throws Error with message `REASON_REQUIRED` if `reason` is not a string or is empty/whitespace only
 */
function assertValidReason(reason: unknown): asserts reason is string {
    if (typeof reason !== "string" || reason.trim().length === 0) {
        throw new Error("REASON_REQUIRED");
    }
}

/**
 * Adjusts a team's penalty for a game result and records an audit entry.
 *
 * @param teamGameResultId - ID of the team game result whose penalty will be adjusted
 * @param operation - Either `"SET"` to replace the penalty or `"INCREMENT"` to add to it
 * @param value - Non-negative integer number of seconds to set or add
 * @param adminId - ID of the administrator performing the adjustment
 * @param reason - Non-empty justification for the change; leading and trailing whitespace will be trimmed
 * @returns The repository response for the penalty adjustment
 */
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

/**
 * Retrieves the penalty history for a specific team game result.
 *
 * @param teamGameResultId - The ID of the team game result to fetch history for
 * @returns The penalty history records for the specified team game result
 */
export async function getPenaltyHistoryService(teamGameResultId: string) {
    return await getPenaltyHistoryRepo(teamGameResultId);
}
