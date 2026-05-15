import type {
    MatchResultLifecycleStatus,
    ResolveMatchResultLifecycleStatusInput,
} from "../types/matchResultMaintenance.types";

const sixHoursInMs = 6 * 60 * 60 * 1000;
const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

export function resolveMatchResultLifecycleStatus({
    eventStatus,
    startDate,
    hasResult,
    resultValidationStatus = null,
    now = new Date(),
}: ResolveMatchResultLifecycleStatusInput): MatchResultLifecycleStatus {
    if (eventStatus === "cancelled") {
        return "cancelled";
    }

    if (resultValidationStatus === "accepted") {
        return "validated";
    }

    const elapsedTime = now.getTime() - new Date(startDate).getTime();

    if (elapsedTime >= twentyFourHoursInMs) {
        return "expired";
    }

    if (hasResult) {
        return "pending_validation";
    }

    if (elapsedTime >= sixHoursInMs) {
        return "pending_result";
    }

    return "scheduled";
}
