import { useEffect, useState } from "react";
import {
    emptyCompetitiveInsights,
    getProfileCompetitiveInsights,
} from "../services/profileCompetitiveInsights.service";
import type {
    CompetitiveInsightsFilter,
    CompetitiveProfileInsights,
} from "../types/profileCompetitiveInsights.types";

const PROFILE_INSIGHTS_CACHE_TTL_MS = 60_000;

interface CompetitiveInsightsCacheEntry {
    value: CompetitiveProfileInsights;
    expiresAt: number;
}

const competitiveInsightsCache = new Map<string, CompetitiveInsightsCacheEntry>();
const competitiveInsightsInflightRequests = new Map<
    string,
    Promise<CompetitiveProfileInsights>
>();

function buildInsightsCacheKey(
    userId: string,
    selectedFilter: CompetitiveInsightsFilter,
    fallbackRating?: number
) {
    return `${userId}:${selectedFilter}:${fallbackRating ?? "default"}`;
}

function getCachedInsights(
    userId?: string,
    selectedFilter?: CompetitiveInsightsFilter,
    fallbackRating?: number
) {
    if (!userId || !selectedFilter) {
        return null;
    }

    const cacheKey = buildInsightsCacheKey(userId, selectedFilter, fallbackRating);
    const entry = competitiveInsightsCache.get(cacheKey);

    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        competitiveInsightsCache.delete(cacheKey);
        return null;
    }

    return entry.value;
}

async function getCachedProfileInsights(
    userId: string,
    selectedFilter: CompetitiveInsightsFilter,
    fallbackRating?: number
) {
    const cacheKey = buildInsightsCacheKey(userId, selectedFilter, fallbackRating);
    const cachedInsights = getCachedInsights(userId, selectedFilter, fallbackRating);

    if (cachedInsights) {
        return cachedInsights;
    }

    const inflightRequest = competitiveInsightsInflightRequests.get(cacheKey);

    if (inflightRequest) {
        return inflightRequest;
    }

    const request = getProfileCompetitiveInsights(
        userId,
        selectedFilter,
        fallbackRating
    ).then((data) => {
        competitiveInsightsCache.set(cacheKey, {
            value: data,
            expiresAt: Date.now() + PROFILE_INSIGHTS_CACHE_TTL_MS,
        });

        return data;
    });

    competitiveInsightsInflightRequests.set(cacheKey, request);

    try {
        return await request;
    } finally {
        competitiveInsightsInflightRequests.delete(cacheKey);
    }
}

export function useProfileCompetitiveInsights(
    userId?: string,
    fallbackRating?: number
) {
    const [selectedFilter, setSelectedFilter] =
        useState<CompetitiveInsightsFilter>("last_10_matches");
    const [insights, setInsights] = useState<CompetitiveProfileInsights>(
        getCachedInsights(userId, "last_10_matches", fallbackRating) ??
            emptyCompetitiveInsights
    );
    const [loading, setLoading] = useState(
        Boolean(userId) &&
            !getCachedInsights(userId, "last_10_matches", fallbackRating)
    );
    const [error, setError] = useState("");

    useEffect(() => {
        let isCancelled = false;

        async function loadInsights() {
            if (!userId) {
                setInsights(emptyCompetitiveInsights);
                setLoading(false);
                setError("");
                return;
            }

            try {
                if (!getCachedInsights(userId, selectedFilter, fallbackRating)) {
                    setLoading(true);
                }

                setError("");

                const data = await getCachedProfileInsights(
                    userId,
                    selectedFilter,
                    fallbackRating
                );

                if (!isCancelled) {
                    setInsights(data);
                }
            } catch (loadError) {
                console.error(loadError);

                if (!isCancelled) {
                    setInsights(emptyCompetitiveInsights);
                    setError("Could not load competitive insights");
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        loadInsights();

        return () => {
            isCancelled = true;
        };
    }, [fallbackRating, selectedFilter, userId]);

    return {
        selectedFilter,
        setSelectedFilter,
        insights,
        loading,
        error,
    };
}
