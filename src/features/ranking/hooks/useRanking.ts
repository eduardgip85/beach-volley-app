import { useEffect, useMemo, useState } from "react";
import { getCompetitiveRanking } from "../services/ranking.service";
import {
    getRankingEmptyStateMessage,
    getRankingScopeLabel,
} from "../utils/ranking.utils";
import type { RankingPlayer, RankingScope } from "../types/ranking.types";

interface UseRankingOptions {
    isAuthenticated: boolean;
    country: string | null;
}

const RANKING_CACHE_TTL_MS = 60_000;

interface RankingCacheEntry {
    value: RankingPlayer[];
    expiresAt: number;
}

const rankingCache = new Map<string, RankingCacheEntry>();
const rankingInflightRequests = new Map<string, Promise<RankingPlayer[]>>();

function buildRankingCacheKey(scope: RankingScope, country: string | null) {
    return `${scope}:${country ?? ""}`;
}

function getCachedRanking(scope: RankingScope, country: string | null) {
    const entry = rankingCache.get(buildRankingCacheKey(scope, country));

    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        rankingCache.delete(buildRankingCacheKey(scope, country));
        return null;
    }

    return entry.value;
}

async function getCachedCompetitiveRanking(
    scope: RankingScope,
    country: string | null
) {
    const cacheKey = buildRankingCacheKey(scope, country);
    const cachedPlayers = getCachedRanking(scope, country);

    if (cachedPlayers) {
        return cachedPlayers;
    }

    const inflightRequest = rankingInflightRequests.get(cacheKey);

    if (inflightRequest) {
        return inflightRequest;
    }

    const request = getCompetitiveRanking({
        scope,
        country,
        limit: 50,
    }).then((players) => {
        rankingCache.set(cacheKey, {
            value: players,
            expiresAt: Date.now() + RANKING_CACHE_TTL_MS,
        });

        return players;
    });

    rankingInflightRequests.set(cacheKey, request);

    try {
        return await request;
    } finally {
        rankingInflightRequests.delete(cacheKey);
    }
}

export function useRanking({ isAuthenticated, country }: UseRankingOptions) {
    const [scope, setScope] = useState<RankingScope>("global");
    const [players, setPlayers] = useState<RankingPlayer[]>(
        getCachedRanking("global", country) ?? []
    );
    const [loading, setLoading] = useState(
        !getCachedRanking("global", country)
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadRanking() {
            if (scope === "country" && !country) {
                setPlayers([]);
                setError(null);
                setLoading(false);
                return;
            }

            if (scope === "friends" && !isAuthenticated) {
                setPlayers([]);
                setError(null);
                setLoading(false);
                return;
            }

            try {
                const cachedPlayers = getCachedRanking(scope, country);

                if (!cachedPlayers) {
                    setLoading(true);
                }

                setError(null);

                const nextPlayers = await getCachedCompetitiveRanking(scope, country);

                if (!cancelled) {
                    setPlayers(nextPlayers);
                }
            } catch (loadError) {
                if (!cancelled) {
                    setPlayers([]);
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Could not load ranking"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadRanking();

        return () => {
            cancelled = true;
        };
    }, [scope, isAuthenticated, country]);

    const scopeLabel = useMemo(() => getRankingScopeLabel(scope), [scope]);
    const emptyMessage = useMemo(
        () =>
            getRankingEmptyStateMessage(scope, {
                hasCountry: Boolean(country),
                isAuthenticated,
            }),
        [country, isAuthenticated, scope]
    );

    return {
        scope,
        setScope,
        scopeLabel,
        players,
        loading,
        error,
        emptyMessage,
        hasCountryScope: Boolean(country),
        hasFriendsScope: isAuthenticated,
    };
}
