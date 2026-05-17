import type { RankingScope } from "../types/ranking.types";

export function getRankingScopeLabel(scope: RankingScope) {
    switch (scope) {
        case "country":
            return "Country";
        case "friends":
            return "Friends";
        default:
            return "Global";
    }
}

export function calculateWinRate(wins: number, losses: number) {
    const totalMatches = wins + losses;

    if (totalMatches === 0) {
        return 0;
    }

    return Number(((wins / totalMatches) * 100).toFixed(1));
}

export function getRankingEmptyStateMessage(
    scope: RankingScope,
    options: {
        hasCountry: boolean;
        isAuthenticated: boolean;
    }
) {
    if (scope === "country" && !options.hasCountry) {
        return "Add a country to your profile to unlock local ranking.";
    }

    if (scope === "friends" && !options.isAuthenticated) {
        return "Log in to compare your rating with accepted friends.";
    }

    if (scope === "friends") {
        return "No ranked friends yet. Play competitive matches and grow your network.";
    }

    if (scope === "country") {
        return "No ranked players found for this country yet.";
    }

    return "No competitive ranking data yet. Validate a competitive match to appear here.";
}
