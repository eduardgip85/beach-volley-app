export type MatchResultValidationStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "disputed"
    | "expired";

export type MatchWinningTeam = "team_a" | "team_b";

export interface MatchSet {
    id: string;
    resultId: string;
    setNumber: number;
    teamAScore: number;
    teamBScore: number;
}

export interface CreateMatchSetPayload {
    setNumber: number;
    teamAScore: number;
    teamBScore: number;
}

export interface MatchResult {
    id: string;
    eventId: string;
    submittedBy: string;
    winningTeam: MatchWinningTeam | null;
    validationStatus: MatchResultValidationStatus;
    validatedBy: string | null;
    createdAt: string;
    updatedAt: string;
    sets: MatchSet[];
}
