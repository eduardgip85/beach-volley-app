import { useEffect, useState } from "react";
import { t } from "i18next";
import { getStatsData } from "../services/stats.service";
import type { AdminAnalyticsData, AnalyticsTimeFilter } from "../types/stats.types";

const ADMIN_ANALYTICS_CACHE_TTL_MS = 60_000;

interface AdminAnalyticsCacheEntry {
  value: AdminAnalyticsData;
  expiresAt: number;
}

const adminAnalyticsCache = new Map<AnalyticsTimeFilter, AdminAnalyticsCacheEntry>();
const adminAnalyticsInflightRequests = new Map<
  AnalyticsTimeFilter,
  Promise<AdminAnalyticsData>
>();

function getCachedAdminAnalytics(filterKey: AnalyticsTimeFilter) {
  const entry = adminAnalyticsCache.get(filterKey);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    adminAnalyticsCache.delete(filterKey);
    return null;
  }

  return entry.value;
}

async function getCachedStatsData(filterKey: AnalyticsTimeFilter) {
  const cachedStats = getCachedAdminAnalytics(filterKey);

  if (cachedStats) {
    return cachedStats;
  }

  const inflightRequest = adminAnalyticsInflightRequests.get(filterKey);

  if (inflightRequest) {
    return inflightRequest;
  }

  const request = getStatsData(filterKey).then((data) => {
    adminAnalyticsCache.set(filterKey, {
      value: data,
      expiresAt: Date.now() + ADMIN_ANALYTICS_CACHE_TTL_MS,
    });

    return data;
  });

  adminAnalyticsInflightRequests.set(filterKey, request);

  try {
    return await request;
  } finally {
    adminAnalyticsInflightRequests.delete(filterKey);
  }
}

export function useAdminAnalytics(filterKey: AnalyticsTimeFilter) {
  const [stats, setStats] = useState<AdminAnalyticsData | null>(
    getCachedAdminAnalytics(filterKey)
  );
  const [loading, setLoading] = useState(!getCachedAdminAnalytics(filterKey));
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        if (!getCachedAdminAnalytics(filterKey)) {
          setLoading(true);
        }

        setError("");

        const data = await getCachedStatsData(filterKey);

        if (!isMounted) return;
        setStats(data);
      } catch (err) {
        console.error(err);

        if (!isMounted) return;
        setError(t("adminStats.loadError"));
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
