import { useEffect, useState } from "react";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import { getProfileDashboardStats } from "../services/profileStats.service";
import type { ProfileStatsData } from "../types/profileStats.types";

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

export function useProfileStats(userId?: string) {
    const [stats, setStats] = useState<ProfileStatsData>(emptyStats);
    const [loading, setLoading] = useState(Boolean(userId));
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
                setLoading(true);
                setError("");

                const profileStats = await getProfileDashboardStats(userId);

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
