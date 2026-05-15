import type { EventMode } from "../../events/types/event.types";

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
    avatarUrl: string | null;
    hasBall: boolean;
    hasNet: boolean;
    competitiveRating: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    competitive: PublicProfileModeStats;
    casual: PublicProfileModeStats;
    recentMatches: PublicProfileRecentMatch[];
}
