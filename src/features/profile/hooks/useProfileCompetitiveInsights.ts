import { useEffect, useState } from "react";
import {
    emptyCompetitiveInsights,
    getProfileCompetitiveInsights,
} from "../services/profileCompetitiveInsights.service";
import type {
    CompetitiveInsightsFilter,
    CompetitiveProfileInsights,
} from "../types/profileCompetitiveInsights.types";

export function useProfileCompetitiveInsights(userId?: string) {
    const [selectedFilter, setSelectedFilter] =
        useState<CompetitiveInsightsFilter>("last_10_matches");
    const [insights, setInsights] = useState<CompetitiveProfileInsights>(
        emptyCompetitiveInsights
    );
    const [loading, setLoading] = useState(Boolean(userId));
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
                setLoading(true);
                setError("");

                const data = await getProfileCompetitiveInsights(
                    userId,
                    selectedFilter
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
    }, [selectedFilter, userId]);

    return {
        selectedFilter,
        setSelectedFilter,
        insights,
        loading,
        error,
    };
}
