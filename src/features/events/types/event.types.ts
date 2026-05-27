export type EventType = "match" | "open_play" | "tournament";

export type EventVisibility = "public" | "private";

export type EventMode = "casual" | "competitive";

export type EventStatus = "active" | "cancelled" | "completed";

export type EventResultValidationStatus = "pending" | "accepted" | "rejected";

export type TournamentRegistrationType = "individual" | "team";

export type TournamentTeamFormat = "2v2" | "4v4";

export type TournamentEntryFeeType = "free" | "paid";

export type TournamentBracketType =
    | "single_elimination"
    | "round_robin"
    | "group_knockout"
    | "double_elimination";

export type TournamentState =
    | "draft"
    | "open_registration"
    | "full"
    | "bracket_ready"
    | "in_progress"
    | "completed"
    | "cancelled";

export const UNLIMITED_EVENT_CAPACITY = 9999;

export function isUnlimitedEventCapacity(maxParticipants: number) {
    return maxParticipants >= UNLIMITED_EVENT_CAPACITY;
}

export interface TournamentSettings {
    eventId: string;
    registrationType: TournamentRegistrationType;
    teamFormat: TournamentTeamFormat;
    entryFeeType: TournamentEntryFeeType;
    entryFeeAmount: number | null;
    entryFeeCurrency: string;
    bracketType: TournamentBracketType;
    state: TournamentState;
    maxTeams: number;
    courtCount: number;
    matchDurationMinutes: number;
    finalsDurationMinutes: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface TournamentSettingsInput {
    registrationType: TournamentRegistrationType;
    teamFormat: TournamentTeamFormat;
    entryFeeType: TournamentEntryFeeType;
    entryFeeAmount: number | null;
    entryFeeCurrency?: string;
    bracketType: TournamentBracketType;
    state?: TournamentState;
    maxTeams: number;
    courtCount: number;
    matchDurationMinutes?: number;
    finalsDurationMinutes?: number;
}

export function getTournamentTeamSize(teamFormat: TournamentTeamFormat) {
    return teamFormat === "4v4" ? 4 : 2;
}

export interface Event {
    id: string;
    title: string;
    description: string | null;
    type: EventType;
    visibility: EventVisibility;
    mode: EventMode | null;
    locationName: string;
    latitude: number;
    longitude: number;
    startDate: string;
    endDate: string | null;
    maxParticipants: number;
    status: EventStatus;
    resultValidationStatus?: EventResultValidationStatus | null;
    participantCount?: number;
    imageUrl?: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    tournamentSettings?: TournamentSettings | null;
}

export interface CreateEventPayload {
    title: string;
    description: string;
    type: EventType;
    visibility: EventVisibility;
    mode: EventMode | null;
    locationName: string;
    latitude: number;
    longitude: number;
    imageUrl?: string | null;
    startDate: string;
    endDate?: string | null;
    maxParticipants: number;
    tournamentSettings?: TournamentSettingsInput | null;
}
