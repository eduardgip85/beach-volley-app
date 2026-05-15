import type { MatchResultValidationStatus } from "./matchResult.types";

export type MatchResultLifecycleStatus =
    | "scheduled"
    | "pending_result"
    | "pending_validation"
    | "validated"
    | "expired"
    | "cancelled";

export interface ResolveMatchResultLifecycleStatusInput {
    eventStatus: string;
    startDate: string;
    hasResult: boolean;
    resultValidationStatus?: MatchResultValidationStatus | null;
    now?: Date;
}
