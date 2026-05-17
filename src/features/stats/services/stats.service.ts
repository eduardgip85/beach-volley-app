import { supabase } from "../../../config/supabase";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import type {
  AdminAnalyticsData,
  AnalyticsPeakDay,
  AnalyticsRatioPoint,
  AnalyticsTimeFilter,
  AnalyticsTopLocation,
  AnalyticsTopRatedPlayer,
  AnalyticsTopUser,
  AnalyticsTrendPoint,
  RatingDistributionBucket,
} from "../types/stats.types";

type JsonRecord = Record<string, unknown>;

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toTrendPoints(value: unknown): AnalyticsTrendPoint[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      label: toString(item.label),
      count: toNumber(item.count),
    }));
}

function toRatioPoints(value: unknown): AnalyticsRatioPoint[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      name: toString(item.name),
      value: toNumber(item.value),
    }));
}

function toTopUsers(value: unknown): AnalyticsTopUser[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      id: toString(item.id),
      fullName: toString(item.fullName),
      avatarUrl: typeof item.avatarUrl === "string" ? item.avatarUrl : null,
      activityCount: toNumber(item.activityCount),
    }));
}

function toTopLocations(value: unknown): AnalyticsTopLocation[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      locationName: toString(item.locationName),
      eventsCount: toNumber(item.eventsCount),
    }));
}

function toPeakDays(value: unknown): AnalyticsPeakDay[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      day: toString(item.day),
      count: toNumber(item.count),
    }));
}

function toTopRatedPlayers(value: unknown): AnalyticsTopRatedPlayer[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      id: toString(item.id),
      fullName: toString(item.fullName),
      avatarUrl: typeof item.avatarUrl === "string" ? item.avatarUrl : null,
      country: typeof item.country === "string" ? item.country : null,
      competitiveRating: toNumber(item.competitiveRating, DEFAULT_COMPETITIVE_RATING),
      wins: toNumber(item.wins),
      losses: toNumber(item.losses),
    }));
}

function toRatingDistribution(value: unknown): RatingDistributionBucket[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      label: toString(item.label),
      count: toNumber(item.count),
    }));
}

function getEmptyAnalytics(filterKey: AnalyticsTimeFilter): AdminAnalyticsData {
  return {
    metadata: {
      filterKey,
      generatedAt: new Date().toISOString(),
    },
    userAnalytics: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersWeek: 0,
      newUsersMonth: 0,
      verifiedEquipmentUsers: 0,
      competitiveUsers: 0,
      newUsersTrend: [],
    },
    matchAnalytics: {
      totalMatches: 0,
      casualMatches: 0,
      competitiveMatches: 0,
      publicMatches: 0,
      privateMatches: 0,
      matchesCompleted: 0,
      cancelledMatches: 0,
      eventsTrend: [],
      formatRatio: [],
      visibilityRatio: [],
    },
    engagementAnalytics: {
      averagePlayersPerEvent: 0,
      mostActiveUsers: [],
      mostActiveLocations: [],
      peakActivityDays: [],
    },
    rankingAnalytics: {
      averageRating: DEFAULT_COMPETITIVE_RATING,
      highestRatedPlayers: [],
      ratingDistribution: [],
    },
  };
}

function mapAdminAnalytics(
  value: unknown,
  filterKey: AnalyticsTimeFilter
): AdminAnalyticsData {
  if (!isRecord(value)) {
    return getEmptyAnalytics(filterKey);
  }

  const metadata = isRecord(value.metadata) ? value.metadata : {};
  const userAnalytics = isRecord(value.userAnalytics) ? value.userAnalytics : {};
  const matchAnalytics = isRecord(value.matchAnalytics) ? value.matchAnalytics : {};
  const engagementAnalytics = isRecord(value.engagementAnalytics)
    ? value.engagementAnalytics
    : {};
  const rankingAnalytics = isRecord(value.rankingAnalytics)
    ? value.rankingAnalytics
    : {};

  return {
    metadata: {
      filterKey:
        toString(metadata.filterKey, filterKey) as AnalyticsTimeFilter,
      generatedAt: toString(metadata.generatedAt, new Date().toISOString()),
    },
    userAnalytics: {
      totalUsers: toNumber(userAnalytics.totalUsers),
      activeUsers: toNumber(userAnalytics.activeUsers),
      newUsersWeek: toNumber(userAnalytics.newUsersWeek),
      newUsersMonth: toNumber(userAnalytics.newUsersMonth),
      verifiedEquipmentUsers: toNumber(userAnalytics.verifiedEquipmentUsers),
      competitiveUsers: toNumber(userAnalytics.competitiveUsers),
      newUsersTrend: toTrendPoints(userAnalytics.newUsersTrend),
    },
    matchAnalytics: {
      totalMatches: toNumber(matchAnalytics.totalMatches),
      casualMatches: toNumber(matchAnalytics.casualMatches),
      competitiveMatches: toNumber(matchAnalytics.competitiveMatches),
      publicMatches: toNumber(matchAnalytics.publicMatches),
      privateMatches: toNumber(matchAnalytics.privateMatches),
      matchesCompleted: toNumber(matchAnalytics.matchesCompleted),
      cancelledMatches: toNumber(matchAnalytics.cancelledMatches),
      eventsTrend: toTrendPoints(matchAnalytics.eventsTrend),
      formatRatio: toRatioPoints(matchAnalytics.formatRatio),
      visibilityRatio: toRatioPoints(matchAnalytics.visibilityRatio),
    },
    engagementAnalytics: {
      averagePlayersPerEvent: toNumber(engagementAnalytics.averagePlayersPerEvent),
      mostActiveUsers: toTopUsers(engagementAnalytics.mostActiveUsers),
      mostActiveLocations: toTopLocations(
        engagementAnalytics.mostActiveLocations
      ),
      peakActivityDays: toPeakDays(engagementAnalytics.peakActivityDays),
    },
    rankingAnalytics: {
      averageRating: toNumber(rankingAnalytics.averageRating, DEFAULT_COMPETITIVE_RATING),
      highestRatedPlayers: toTopRatedPlayers(
        rankingAnalytics.highestRatedPlayers
      ),
      ratingDistribution: toRatingDistribution(
        rankingAnalytics.ratingDistribution
      ),
    },
  };
}

export async function getStatsData(
  filterKey: AnalyticsTimeFilter
): Promise<AdminAnalyticsData> {
  const { data, error } = await supabase.rpc("get_admin_analytics", {
    filter_key: filterKey,
  });

  if (error) throw error;

  return mapAdminAnalytics(data, filterKey);
}
