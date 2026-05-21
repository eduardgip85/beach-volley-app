import { supabase } from "../../../config/supabase";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import { getEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
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

function getRangeStart(filterKey: AnalyticsTimeFilter) {
  if (filterKey === "all_time") {
    return null;
  }

  const now = new Date();
  const start = new Date(now);

  if (filterKey === "last_7_days") {
    start.setDate(now.getDate() - 7);
  } else if (filterKey === "last_30_days") {
    start.setDate(now.getDate() - 30);
  } else {
    start.setDate(now.getDate() - 90);
  }

  return start;
}

function isEventInsideFilter(event: Event, filterKey: AnalyticsTimeFilter) {
  if (filterKey === "all_time") {
    return true;
  }

  const start = getRangeStart(filterKey);

  if (!start) {
    return true;
  }

  const eventDate = new Date(event.startDate);
  const now = new Date();

  return eventDate >= start && eventDate <= now;
}

function groupDateLabel(date: Date, filterKey: AnalyticsTimeFilter) {
  if (filterKey === "last_90_days" || filterKey === "all_time") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  return date.toISOString().slice(0, 10);
}

function toSortedTrendPoints(groupedCounts: Map<string, number>) {
  return Array.from(groupedCounts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, count]) => ({ label, count }));
}

function buildEventTrend(events: Event[], filterKey: AnalyticsTimeFilter) {
  const groupedCounts = new Map<string, number>();

  for (const event of events) {
    const label = groupDateLabel(new Date(event.startDate), filterKey);
    groupedCounts.set(label, (groupedCounts.get(label) ?? 0) + 1);
  }

  return toSortedTrendPoints(groupedCounts);
}

function buildPeakDays(events: Event[]): AnalyticsPeakDay[] {
  const dayCounts = new Map<string, number>();

  for (const event of events) {
    const day = new Date(event.startDate).toLocaleDateString("en-US", {
      weekday: "long",
    });
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }

  return Array.from(dayCounts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([day, count]) => ({ day, count }));
}

function buildTopLocations(events: Event[]): AnalyticsTopLocation[] {
  const locationCounts = new Map<string, number>();

  for (const event of events) {
    const locationName = event.locationName.trim();

    if (!locationName) {
      continue;
    }

    locationCounts.set(locationName, (locationCounts.get(locationName) ?? 0) + 1);
  }

  return Array.from(locationCounts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 5)
    .map(([locationName, eventsCount]) => ({ locationName, eventsCount }));
}

function buildEventDrivenAnalytics(
  base: AdminAnalyticsData,
  events: Event[],
  filterKey: AnalyticsTimeFilter
): AdminAnalyticsData {
  const filteredEvents = events.filter((event) => isEventInsideFilter(event, filterKey));
  const filteredMatches = filteredEvents.filter((event) => event.type === "match");
  const casualMatches = filteredMatches.filter((event) => event.mode === "casual");
  const competitiveMatches = filteredMatches.filter(
    (event) => event.mode === "competitive"
  );
  const publicMatches = filteredMatches.filter((event) => event.visibility === "public");
  const privateMatches = filteredMatches.filter((event) => event.visibility === "private");
  const matchesCompleted = filteredMatches.filter(
    (event) => event.status === "completed"
  ).length;
  const cancelledMatches = filteredMatches.filter(
    (event) => event.status === "cancelled"
  ).length;
  const participantTotal = filteredEvents.reduce(
    (sum, event) => sum + (event.participantCount ?? 0),
    0
  );

  return {
    ...base,
    matchAnalytics: {
      ...base.matchAnalytics,
      totalMatches: filteredMatches.length,
      casualMatches: casualMatches.length,
      competitiveMatches: competitiveMatches.length,
      publicMatches: publicMatches.length,
      privateMatches: privateMatches.length,
      matchesCompleted,
      cancelledMatches,
      eventsTrend: buildEventTrend(filteredEvents, filterKey),
      formatRatio: [
        { name: "Casual", value: casualMatches.length },
        { name: "Competitive", value: competitiveMatches.length },
      ],
      visibilityRatio: [
        { name: "Public", value: publicMatches.length },
        { name: "Private", value: privateMatches.length },
      ],
    },
    engagementAnalytics: {
      ...base.engagementAnalytics,
      averagePlayersPerEvent:
        filteredEvents.length > 0
          ? Number((participantTotal / filteredEvents.length).toFixed(1))
          : 0,
      mostActiveLocations: buildTopLocations(filteredEvents),
      peakActivityDays: buildPeakDays(filteredEvents),
    },
  };
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

  const base = mapAdminAnalytics(data, filterKey);

  try {
    const events = await getEvents();
    return buildEventDrivenAnalytics(base, events, filterKey);
  } catch (eventsError) {
    console.error("Could not refresh event-driven admin analytics", eventsError);
    return base;
  }
}
