import type { Event } from "../../events/types/event.types";
import type { MatchResult } from "../../match-results/types/matchResult.types";

export interface ProfileStatsSnapshot {
    competitiveRating: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
}

export interface ProfileModeStats {
    matchesPlayed: number;
    wins: number;
    losses: number;
}

export interface ProfileRecentMatch {
    event: Event;
    result: MatchResult;
    outcome: "win" | "loss";
}

export interface ProfileStatsData extends ProfileStatsSnapshot {
    competitive: ProfileModeStats;
    casual: ProfileModeStats;
    recentMatches: ProfileRecentMatch[];
}
