import type { EventMode } from "../../events/types/event.types";
import type {
    AvailabilityStatus,
    PreferredCourtSide,
    PreferredHand,
    PreferredMatchMode,
    PreferredPlayDay,
} from "../../auth/types/auth.types";

export interface PublicProfileModeStats {
    matchesPlayed: number;
    wins: number;
    losses: number;
}

export interface PublicProfileRecentMatchSet {
    setNumber: number;
    teamAScore: number;
    teamBScore: number;
}

export interface PublicProfileRecentMatch {
    eventId: string;
    title: string;
    startDate: string;
    mode: EventMode | null;
    winningTeam: "team_a" | "team_b";
    playerTeam: "team_a" | "team_b";
    outcome: "win" | "loss";
    sets: PublicProfileRecentMatchSet[];
}

export interface PublicPlayerProfile {
    id: string;
    fullName: string;
    username: string | null;
    avatarUrl: string | null;
    country: string | null;
    hasBall: boolean;
    hasNet: boolean;
    competitiveRating: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    profileVisibility: "public" | "private";
    showRating: boolean;
    showStats: boolean;
    preferredHand: PreferredHand;
    preferredCourtSide: PreferredCourtSide;
    preferredMatchMode: PreferredMatchMode;
    availabilityStatus: AvailabilityStatus;
    preferredPlayDays: PreferredPlayDay[];
    competitive: PublicProfileModeStats;
    casual: PublicProfileModeStats;
    recentMatches: PublicProfileRecentMatch[];
}
