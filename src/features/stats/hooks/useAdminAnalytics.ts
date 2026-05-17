import { useEffect, useState } from "react";
import { getStatsData } from "../services/stats.service";
import type { AdminAnalyticsData, AnalyticsTimeFilter } from "../types/stats.types";

export function useAdminAnalytics(filterKey: AnalyticsTimeFilter) {
  const [stats, setStats] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const data = await getStatsData(filterKey);

        if (!isMounted) return;
        setStats(data);
      } catch (err) {
        console.error(err);

        if (!isMounted) return;
        setError("Could not load admin analytics");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [filterKey]);

  return {
    stats,
    loading,
    error,
  };
}
