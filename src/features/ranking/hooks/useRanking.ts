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

export function useRanking({ isAuthenticated, country }: UseRankingOptions) {
    const [scope, setScope] = useState<RankingScope>("global");
    const [players, setPlayers] = useState<RankingPlayer[]>([]);
    const [loading, setLoading] = useState(true);
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
                setLoading(true);
                setError(null);

                const nextPlayers = await getCompetitiveRanking({
                    scope,
                    country,
                    limit: 50,
                });

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
