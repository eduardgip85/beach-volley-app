import type { CompetitiveInsightsFilter } from "../types/profileCompetitiveInsights.types";
import type { ProfileRecentMatch } from "../types/profileStats.types";

export interface MatchHistorySummary {
    matchesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    currentStreak: number;
    bestStreak: number;
}

function sortMatchesByDateDesc(matches: ProfileRecentMatch[]) {
    return [...matches].sort((left, right) =>
        right.event.startDate.localeCompare(left.event.startDate)
    );
}

export function applyMatchHistoryFilter(
    matches: ProfileRecentMatch[],
    filter: CompetitiveInsightsFilter
) {
    const sortedMatches = sortMatchesByDateDesc(matches);

    switch (filter) {
        case "last_5_matches":
            return sortedMatches.slice(0, 5);
        case "last_10_matches":
            return sortedMatches.slice(0, 10);
        case "last_30_days": {
            const threshold = Date.now() - 30 * 24 * 60 * 60 * 1000;

            return sortedMatches.filter(
                (match) => new Date(match.event.startDate).getTime() >= threshold
            );
        }
        case "all_time":
        default:
            return sortedMatches;
    }
}

export function buildMatchHistorySummary(
    matches: ProfileRecentMatch[]
): MatchHistorySummary {
    const sortedMatches = sortMatchesByDateDesc(matches);
    const wins = sortedMatches.filter((match) => match.outcome === "win").length;
    const losses = sortedMatches.filter((match) => match.outcome === "loss").length;

    let currentStreak = 0;
    for (const match of sortedMatches) {
        if (match.outcome !== "win") {
            break;
        }

        currentStreak += 1;
    }

    let bestStreak = 0;
    let runningStreak = 0;
    for (const match of sortedMatches) {
        if (match.outcome === "win") {
            runningStreak += 1;
            bestStreak = Math.max(bestStreak, runningStreak);
            continue;
        }

        runningStreak = 0;
    }

    return {
        matchesPlayed: sortedMatches.length,
        wins,
        losses,
        winRate:
            sortedMatches.length > 0
                ? Number(((wins / sortedMatches.length) * 100).toFixed(1))
                : 0,
        currentStreak,
        bestStreak,
    };
}
