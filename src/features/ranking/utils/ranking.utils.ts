import type { RankingScope } from "../types/ranking.types";
import i18n from "../../../i18n";

export function getRankingScopeLabel(scope: RankingScope) {
    switch (scope) {
        case "country":
            return i18n.t("ranking.tabs.country");
        case "friends":
            return i18n.t("ranking.tabs.friends");
        default:
            return i18n.t("ranking.tabs.global");
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
        return i18n.t("ranking.emptyCountryUnlock");
    }

    if (scope === "friends" && !options.isAuthenticated) {
        return i18n.t("ranking.emptyFriendsLogin");
    }

    if (scope === "friends") {
        return i18n.t("ranking.emptyFriends");
    }

    if (scope === "country") {
        return i18n.t("ranking.emptyCountry");
    }

    return i18n.t("ranking.emptyGlobal");
}
