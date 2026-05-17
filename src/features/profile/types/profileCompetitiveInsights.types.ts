import type { EventMode } from "../../events/types/event.types";

export type CompetitiveInsightsFilter =
    | "last_5_matches"
    | "last_10_matches"
    | "last_30_days"
    | "all_time";

export interface CompetitiveChartPoint {
    id: string;
    eventId: string;
    rating: number;
    ratingDelta: number;
    date: string;
    createdAt: string;
    label: string;
}

export interface CompetitiveHistorySet {
    setNumber: number;
    teamAScore: number;
    teamBScore: number;
}

export interface CompetitiveHistoryMatch {
    historyId: string;
    eventId: string;
    title: string;
    locationName: string;
    startDate: string;
    mode: EventMode | null;
    outcome: "win" | "loss";
    winningTeam: "team_a" | "team_b" | null;
    playerTeam: "team_a" | "team_b" | null;
    rating: number | null;
    ratingDelta: number | null;
    sets: CompetitiveHistorySet[];
}

export interface CompetitiveProfileInsights {
    currentRating: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    currentStreak: number;
    bestStreak: number;
    averageRating: number;
    chartPoints: CompetitiveChartPoint[];
    matchHistory: CompetitiveHistoryMatch[];
}
