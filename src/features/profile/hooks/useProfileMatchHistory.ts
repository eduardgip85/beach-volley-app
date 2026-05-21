import { useEffect, useState } from "react";
import { t } from "i18next";
import { getProfileMatchHistory } from "../services/profileMatchHistory.service";
import type { ProfileMatchHistoryModeFilter, ProfileRecentMatch } from "../types/profileStats.types";

interface UseProfileMatchHistoryOptions {
    modeFilter?: ProfileMatchHistoryModeFilter;
    limitCount?: number;
}

const PROFILE_MATCH_HISTORY_CACHE_TTL_MS = 60_000;

interface MatchHistoryCacheEntry {
    value: ProfileRecentMatch[];
    expiresAt: number;
}

const profileMatchHistoryCache = new Map<string, MatchHistoryCacheEntry>();
const profileMatchHistoryInflightRequests = new Map<
    string,
    Promise<ProfileRecentMatch[]>
>();

function buildMatchHistoryCacheKey(
    userId: string,
    modeFilter: ProfileMatchHistoryModeFilter,
    limitCount?: number
) {
    return `${userId}:${modeFilter}:${limitCount ?? "all"}`;
}

function getCachedMatchHistory(
    userId?: string,
    modeFilter: ProfileMatchHistoryModeFilter = "all",
    limitCount?: number
) {
    if (!userId) {
        return null;
    }

    const cacheKey = buildMatchHistoryCacheKey(userId, modeFilter, limitCount);
    const entry = profileMatchHistoryCache.get(cacheKey);

    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        profileMatchHistoryCache.delete(cacheKey);
        return null;
    }

    return entry.value;
}

async function getCachedProfileMatchHistory(
    userId: string,
    modeFilter: ProfileMatchHistoryModeFilter,
    limitCount?: number
) {
    const cacheKey = buildMatchHistoryCacheKey(userId, modeFilter, limitCount);
    const cachedMatches = getCachedMatchHistory(userId, modeFilter, limitCount);

    if (cachedMatches) {
        return cachedMatches;
    }

    const inflightRequest = profileMatchHistoryInflightRequests.get(cacheKey);

    if (inflightRequest) {
        return inflightRequest;
    }

    const request = getProfileMatchHistory(userId, modeFilter, limitCount).then(
        (matches) => {
            profileMatchHistoryCache.set(cacheKey, {
                value: matches,
                expiresAt: Date.now() + PROFILE_MATCH_HISTORY_CACHE_TTL_MS,
            });

            return matches;
        }
    );

    profileMatchHistoryInflightRequests.set(cacheKey, request);

    try {
        return await request;
    } finally {
        profileMatchHistoryInflightRequests.delete(cacheKey);
    }
}

export function useProfileMatchHistory(
    userId?: string,
    {
        modeFilter = "all",
        limitCount,
    }: UseProfileMatchHistoryOptions = {}
) {
    const [matches, setMatches] = useState<ProfileRecentMatch[]>(
        getCachedMatchHistory(userId, modeFilter, limitCount) ?? []
    );
    const [loading, setLoading] = useState(
        Boolean(userId) &&
            !getCachedMatchHistory(userId, modeFilter, limitCount)
    );
    const [error, setError] = useState("");

    useEffect(() => {
        let isCancelled = false;

        async function loadMatchHistory() {
            if (!userId) {
                setMatches([]);
                setLoading(false);
                setError("");
                return;
            }

            try {
                if (!getCachedMatchHistory(userId, modeFilter, limitCount)) {
                    setLoading(true);
                }

                setError("");

                const data = await getCachedProfileMatchHistory(
                    userId,
                    modeFilter,
                    limitCount
                );

                if (!isCancelled) {
                    setMatches(data);
                }
            } catch (loadError) {
                console.error(loadError);

                if (!isCancelled) {
                    setMatches([]);
                    setError(t("profile.matchHistoryLoadError"));
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        loadMatchHistory();

        return () => {
            isCancelled = true;
        };
    }, [limitCount, modeFilter, userId]);

    return {
        matches,
        loading,
        error,
    };
}
