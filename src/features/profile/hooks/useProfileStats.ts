import { useEffect, useState } from "react";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import { getProfileDashboardStats } from "../services/profileStats.service";
import type { ProfileStatsData } from "../types/profileStats.types";

const PROFILE_STATS_CACHE_TTL_MS = 60_000;

const emptyStats: ProfileStatsData = {
    competitiveRating: DEFAULT_COMPETITIVE_RATING,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    competitive: {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
    },
    casual: {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
    },
    recentMatches: [],
};

interface ProfileStatsCacheEntry {
    value: ProfileStatsData;
    expiresAt: number;
}

const profileStatsCache = new Map<string, ProfileStatsCacheEntry>();
const profileStatsInflightRequests = new Map<string, Promise<ProfileStatsData>>();

function getCachedProfileStats(userId?: string) {
    if (!userId) {
        return null;
    }

    const entry = profileStatsCache.get(userId);

    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        profileStatsCache.delete(userId);
        return null;
    }

    return entry.value;
}

async function getCachedProfileDashboardStats(userId: string) {
    const cachedStats = getCachedProfileStats(userId);

    if (cachedStats) {
        return cachedStats;
    }

    const inflightRequest = profileStatsInflightRequests.get(userId);

    if (inflightRequest) {
        return inflightRequest;
    }

    const request = getProfileDashboardStats(userId).then((profileStats) => {
        profileStatsCache.set(userId, {
            value: profileStats,
            expiresAt: Date.now() + PROFILE_STATS_CACHE_TTL_MS,
        });

        return profileStats;
    });

    profileStatsInflightRequests.set(userId, request);

    try {
        return await request;
    } finally {
        profileStatsInflightRequests.delete(userId);
    }
}

export function useProfileStats(userId?: string) {
    const [stats, setStats] = useState<ProfileStatsData>(
        getCachedProfileStats(userId) ?? emptyStats
    );
    const [loading, setLoading] = useState(
        Boolean(userId) && !getCachedProfileStats(userId)
    );
    const [error, setError] = useState("");

    useEffect(() => {
        let isCancelled = false;

        async function loadProfileStats() {
            if (!userId) {
                setStats(emptyStats);
                setError("");
                setLoading(false);
                return;
            }

            try {
                if (!getCachedProfileStats(userId)) {
                    setLoading(true);
                }

                setError("");

                const profileStats = await getCachedProfileDashboardStats(userId);

                if (!isCancelled) {
                    setStats(profileStats);
                }
            } catch (err) {
                console.error(err);

                if (!isCancelled) {
                    setError("Could not load profile statistics");
                    setStats(emptyStats);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        loadProfileStats();

        return () => {
            isCancelled = true;
        };
    }, [userId]);

    return {
        stats,
        loading,
        error,
    };
}
