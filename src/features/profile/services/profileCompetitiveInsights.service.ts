import { supabase } from "../../../config/supabase";
import {
    DEFAULT_COMPETITIVE_RATING,
} from "../../ratings/utils/rating-display.utils";
import type {
    CompetitiveChartPoint,
    CompetitiveHistoryMatch,
    CompetitiveHistorySet,
    CompetitiveInsightsFilter,
    CompetitiveProfileInsights,
} from "../types/profileCompetitiveInsights.types";

interface CompetitiveInsightsRpcResponse {
    currentRating?: number | null;
    matchesPlayed?: number | null;
    wins?: number | null;
    losses?: number | null;
    winRate?: number | null;
    currentStreak?: number | null;
    bestStreak?: number | null;
    averageRating?: number | null;
    chartPoints?: CompetitiveChartPointRow[] | null;
    matchHistory?: CompetitiveHistoryMatchRow[] | null;
}

interface CompetitiveChartPointRow {
    id: string;
    eventId: string;
    rating: number | null;
    ratingDelta: number | null;
    date: string;
    createdAt: string;
    label: string;
}

interface CompetitiveHistorySetRow {
    setNumber: number;
    teamAScore: number;
    teamBScore: number;
}

interface CompetitiveHistoryMatchRow {
    historyId: string;
    eventId: string;
    title: string;
    locationName: string;
    startDate: string;
    mode: "casual" | "competitive" | null;
    outcome: "win" | "loss";
    winningTeam: "team_a" | "team_b" | null;
    playerTeam: "team_a" | "team_b" | null;
    rating: number | null;
    ratingDelta: number | null;
    sets: CompetitiveHistorySetRow[] | null;
}

export const emptyCompetitiveInsights: CompetitiveProfileInsights = {
    currentRating: DEFAULT_COMPETITIVE_RATING,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageRating: DEFAULT_COMPETITIVE_RATING,
    chartPoints: [],
    matchHistory: [],
};

function formatChartLabel(date: string) {
    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
        ? ""
        : parsedDate.toLocaleDateString("en", {
            day: "2-digit",
            month: "short",
        });
}

function buildFallbackChartPoints(
    currentRating: number,
    matchesPlayed: number,
    matchHistory: CompetitiveHistoryMatch[]
): CompetitiveChartPoint[] {
    if (matchHistory.length !== 1) {
        return [];
    }

    const [latestMatch] = matchHistory;
    const fallbackDelta =
        latestMatch.ratingDelta ??
        (matchesPlayed === 1 ? Number((currentRating - DEFAULT_COMPETITIVE_RATING).toFixed(2)) : 0);

    return [
        {
            id: latestMatch.historyId || `fallback-${latestMatch.eventId}`,
            eventId: latestMatch.eventId,
            rating: latestMatch.rating ?? currentRating,
            ratingDelta: fallbackDelta,
            date: latestMatch.startDate,
            createdAt: latestMatch.startDate,
            label: formatChartLabel(latestMatch.startDate),
        },
    ];
}

function mapChartPoint(row: CompetitiveChartPointRow): CompetitiveChartPoint {
    return {
        id: row.id,
        eventId: row.eventId,
        rating: row.rating ?? DEFAULT_COMPETITIVE_RATING,
        ratingDelta: row.ratingDelta ?? 0,
        date: row.date,
        createdAt: row.createdAt,
        label: row.label || formatChartLabel(row.date),
    };
}

function mapHistorySet(row: CompetitiveHistorySetRow): CompetitiveHistorySet {
    return {
        setNumber: row.setNumber,
        teamAScore: row.teamAScore,
        teamBScore: row.teamBScore,
    };
}

function mapHistoryMatch(row: CompetitiveHistoryMatchRow): CompetitiveHistoryMatch {
    return {
        historyId: row.historyId,
        eventId: row.eventId,
        title: row.title,
        locationName: row.locationName,
        startDate: row.startDate,
        mode: row.mode,
        outcome: row.outcome,
        winningTeam: row.winningTeam,
        playerTeam: row.playerTeam,
        rating: row.rating ?? null,
        ratingDelta: row.ratingDelta ?? null,
        sets: (row.sets ?? []).map(mapHistorySet),
    };
}

function mapCompetitiveInsights(
    data: CompetitiveInsightsRpcResponse | null,
    fallbackRating?: number
): CompetitiveProfileInsights {
    const safeFallbackRating =
        typeof fallbackRating === "number" && Number.isFinite(fallbackRating)
            ? fallbackRating
            : DEFAULT_COMPETITIVE_RATING;

    if (!data) {
        return {
            ...emptyCompetitiveInsights,
            currentRating: safeFallbackRating,
            averageRating: safeFallbackRating,
        };
    }

    const mappedHistory = (data.matchHistory ?? []).map(mapHistoryMatch);
    const mappedChartPoints = (data.chartPoints ?? []).map(mapChartPoint);
    const rawMatchesPlayed = data.matchesPlayed ?? 0;
    const rawWins = data.wins ?? 0;
    const rawLosses = data.losses ?? 0;
    const inferredMatchesPlayed =
        rawMatchesPlayed > 0
            ? rawMatchesPlayed
            : mappedHistory.length > 0
              ? mappedHistory.length
              : mappedChartPoints.length;
    const inferredWins =
        rawWins > 0 || (rawWins === 0 && rawLosses > 0)
            ? rawWins
            : mappedHistory.filter((match) => match.outcome === "win").length;
    const inferredLosses =
        rawLosses > 0 || (rawLosses === 0 && rawWins > 0)
            ? rawLosses
            : mappedHistory.filter((match) => match.outcome === "loss").length;
    const inferredWinRate =
        inferredMatchesPlayed > 0
            ? Number(((inferredWins / inferredMatchesPlayed) * 100).toFixed(1))
            : 0;
    const hasCompetitiveActivity =
        inferredMatchesPlayed > 0 ||
        mappedHistory.length > 0 ||
        mappedChartPoints.length > 0;
    const historicalCurrentRating = hasCompetitiveActivity
        ? data.currentRating ?? safeFallbackRating
        : safeFallbackRating;
    const displayCurrentRating =
        typeof fallbackRating === "number" && Number.isFinite(fallbackRating)
            ? fallbackRating
            : historicalCurrentRating;
    const fallbackChartPoints = buildFallbackChartPoints(
        historicalCurrentRating,
        inferredMatchesPlayed,
        mappedHistory
    );

    return {
        currentRating: displayCurrentRating,
        matchesPlayed: inferredMatchesPlayed,
        wins: inferredWins,
        losses: inferredLosses,
        winRate:
            typeof data.winRate === "number" && Number.isFinite(data.winRate)
                ? data.winRate
                : inferredWinRate,
        currentStreak: data.currentStreak ?? 0,
        bestStreak: data.bestStreak ?? 0,
        averageRating: hasCompetitiveActivity
            ? data.averageRating ?? historicalCurrentRating
            : displayCurrentRating,
        chartPoints:
            mappedChartPoints.length > 0 ? mappedChartPoints : fallbackChartPoints,
        matchHistory: mappedHistory.map((match, index) => ({
            ...match,
            rating:
                match.rating == null &&
                mappedHistory.length === 1 &&
                index === 0
                    ? historicalCurrentRating
                    : match.rating,
            ratingDelta:
                match.ratingDelta == null &&
                mappedHistory.length === 1 &&
                index === 0
                    ? fallbackChartPoints[0]?.ratingDelta ?? null
                    : match.ratingDelta,
        })),
    };
}

export async function getProfileCompetitiveInsights(
    userId: string,
    filter: CompetitiveInsightsFilter,
    fallbackRating?: number
): Promise<CompetitiveProfileInsights> {
    const { data, error } = await supabase.rpc("get_profile_competitive_insights", {
        target_user_id: userId,
        filter_key: filter,
    });

    if (error) throw error;

    return mapCompetitiveInsights(
        data as CompetitiveInsightsRpcResponse | null,
        fallbackRating
    );
}
