import { supabase } from "../../../config/supabase";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import { getEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import type {
  AdminAnalyticsData,
  AnalyticsPeakDay,
  AnalyticsRecentRegistration,
  AnalyticsRatioPoint,
  AnalyticsTimeFilter,
  AnalyticsTopIdea,
  AnalyticsTopLocation,
  AnalyticsTopRatedPlayer,
  AnalyticsTopUser,
  AnalyticsTrendPoint,
  RatingDistributionBucket,
} from "../types/stats.types";

type JsonRecord = Record<string, unknown>;
type ProfileAnalyticsRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
  rating_placement_completed_at: string | null;
  competitive_rating: number | null;
};
type FeatureRequestAnalyticsRow = {
  id: string;
  title: string;
  status: string;
  moderation_status: string;
  vote_count: number | null;
  created_at: string;
};

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
  return isDateInsideFilter(event.startDate, filterKey);
}

function isDateInsideFilter(dateValue: string, filterKey: AnalyticsTimeFilter) {
  if (filterKey === "all_time") {
    return true;
  }

  const start = getRangeStart(filterKey);

  if (!start) {
    return true;
  }

  const eventDate = new Date(dateValue);
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

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getRecentRegistrationName(profile: ProfileAnalyticsRow) {
  const normalizedName = profile.full_name?.trim();

  if (normalizedName) {
    return normalizedName;
  }

  return "Unnamed player";
}

function toRecentRegistration(
  profile: ProfileAnalyticsRow
): AnalyticsRecentRegistration {
  return {
    id: profile.id,
    fullName: getRecentRegistrationName(profile),
    avatarUrl: profile.avatar_url ?? null,
    country: profile.country ?? null,
    city: profile.city ?? null,
    createdAt: profile.created_at,
    ratingPlacementCompletedAt: profile.rating_placement_completed_at ?? null,
    competitiveRating: toNumber(
      profile.competitive_rating,
      DEFAULT_COMPETITIVE_RATING
    ),
  };
}

function buildUserDrivenAnalytics(
  base: AdminAnalyticsData,
  profiles: ProfileAnalyticsRow[]
): AdminAnalyticsData {
  const todayStart = startOfToday();
  const last7DaysStart = new Date();
  last7DaysStart.setDate(last7DaysStart.getDate() - 7);
  const last30DaysStart = new Date();
  last30DaysStart.setDate(last30DaysStart.getDate() - 30);

  const newUsersToday = profiles.filter(
    (profile) => new Date(profile.created_at) >= todayStart
  ).length;
  const newUsersWeek = profiles.filter(
    (profile) => new Date(profile.created_at) >= last7DaysStart
  ).length;
  const newUsersMonth = profiles.filter(
    (profile) => new Date(profile.created_at) >= last30DaysStart
  ).length;
  const onboardingCompletedUsers = profiles.filter(
    (profile) => Boolean(profile.rating_placement_completed_at)
  ).length;
  const onboardingCompletionRate =
    profiles.length > 0
      ? Number(((onboardingCompletedUsers / profiles.length) * 100).toFixed(1))
      : 0;

  return {
    ...base,
    userAnalytics: {
      ...base.userAnalytics,
      totalUsers: Math.max(base.userAnalytics.totalUsers, profiles.length),
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      onboardingCompletedUsers,
      onboardingCompletionRate,
      recentRegistrations: profiles.slice(0, 10).map(toRecentRegistration),
    },
  };
}

function buildIdeaAnalytics(
  base: AdminAnalyticsData,
  ideas: FeatureRequestAnalyticsRow[],
  filterKey: AnalyticsTimeFilter
): AdminAnalyticsData {
  const totalVotes = ideas.reduce(
    (sum, idea) => sum + toNumber(idea.vote_count),
    0
  );
  const filteredIdeas = ideas.filter((idea) =>
    isDateInsideFilter(idea.created_at, filterKey)
  );
  const statusCounts = new Map<string, number>();
  const moderationCounts = new Map<string, number>();
  const trendCounts = new Map<string, number>();

  for (const idea of ideas) {
    statusCounts.set(idea.status, (statusCounts.get(idea.status) ?? 0) + 1);
    moderationCounts.set(
      idea.moderation_status,
      (moderationCounts.get(idea.moderation_status) ?? 0) + 1
    );
  }

  for (const idea of filteredIdeas) {
    const label = groupDateLabel(new Date(idea.created_at), filterKey);
    trendCounts.set(label, (trendCounts.get(label) ?? 0) + 1);
  }

  const statusCount = (status: string) => statusCounts.get(status) ?? 0;
  const moderationCount = (status: string) => moderationCounts.get(status) ?? 0;

  return {
    ...base,
    ideaAnalytics: {
      totalIdeas: ideas.length,
      ideasSubmittedInRange: filteredIdeas.length,
      pendingIdeas: moderationCount("pending"),
      approvedIdeas: moderationCount("approved"),
      hiddenIdeas: moderationCount("hidden"),
      plannedIdeas: statusCount("planned"),
      inProgressIdeas: statusCount("in_progress"),
      doneIdeas: statusCount("done"),
      rejectedIdeas: statusCount("rejected"),
      duplicateIdeas: statusCount("duplicate"),
      totalVotes,
      averageVotesPerIdea:
        ideas.length > 0 ? Number((totalVotes / ideas.length).toFixed(1)) : 0,
      ideasTrend: toSortedTrendPoints(trendCounts),
      statusRatio: Array.from(statusCounts.entries())
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .map(([name, value]) => ({ name, value })),
      moderationRatio: Array.from(moderationCounts.entries())
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .map(([name, value]) => ({ name, value })),
      topVotedIdeas: [...ideas]
        .sort(
          (left, right) =>
            toNumber(right.vote_count) - toNumber(left.vote_count) ||
            right.created_at.localeCompare(left.created_at)
        )
        .slice(0, 5)
        .map((idea) => ({
          id: idea.id,
          title: idea.title,
          voteCount: toNumber(idea.vote_count),
          status: idea.status,
          moderationStatus: idea.moderation_status,
        })),
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

function toRecentRegistrations(value: unknown): AnalyticsRecentRegistration[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      id: toString(item.id),
      fullName: toString(item.fullName),
      avatarUrl: typeof item.avatarUrl === "string" ? item.avatarUrl : null,
      country: typeof item.country === "string" ? item.country : null,
      city: typeof item.city === "string" ? item.city : null,
      createdAt: toString(item.createdAt),
      ratingPlacementCompletedAt:
        typeof item.ratingPlacementCompletedAt === "string"
          ? item.ratingPlacementCompletedAt
          : null,
      competitiveRating: toNumber(
        item.competitiveRating,
        DEFAULT_COMPETITIVE_RATING
      ),
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

function toTopIdeas(value: unknown): AnalyticsTopIdea[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      id: toString(item.id),
      title: toString(item.title),
      voteCount: toNumber(item.voteCount),
      status: toString(item.status),
      moderationStatus: toString(item.moderationStatus),
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
      newUsersToday: 0,
      newUsersWeek: 0,
      newUsersMonth: 0,
      onboardingCompletedUsers: 0,
      onboardingCompletionRate: 0,
      verifiedEquipmentUsers: 0,
      competitiveUsers: 0,
      newUsersTrend: [],
      recentRegistrations: [],
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
    ideaAnalytics: {
      totalIdeas: 0,
      ideasSubmittedInRange: 0,
      pendingIdeas: 0,
      approvedIdeas: 0,
      hiddenIdeas: 0,
      plannedIdeas: 0,
      inProgressIdeas: 0,
      doneIdeas: 0,
      rejectedIdeas: 0,
      duplicateIdeas: 0,
      totalVotes: 0,
      averageVotesPerIdea: 0,
      ideasTrend: [],
      statusRatio: [],
      moderationRatio: [],
      topVotedIdeas: [],
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
  const ideaAnalytics = isRecord(value.ideaAnalytics) ? value.ideaAnalytics : {};

  return {
    metadata: {
      filterKey:
        toString(metadata.filterKey, filterKey) as AnalyticsTimeFilter,
      generatedAt: toString(metadata.generatedAt, new Date().toISOString()),
    },
    userAnalytics: {
      totalUsers: toNumber(userAnalytics.totalUsers),
      activeUsers: toNumber(userAnalytics.activeUsers),
      newUsersToday: toNumber(userAnalytics.newUsersToday),
      newUsersWeek: toNumber(userAnalytics.newUsersWeek),
      newUsersMonth: toNumber(userAnalytics.newUsersMonth),
      onboardingCompletedUsers: toNumber(userAnalytics.onboardingCompletedUsers),
      onboardingCompletionRate: toNumber(userAnalytics.onboardingCompletionRate),
      verifiedEquipmentUsers: toNumber(userAnalytics.verifiedEquipmentUsers),
      competitiveUsers: toNumber(userAnalytics.competitiveUsers),
      newUsersTrend: toTrendPoints(userAnalytics.newUsersTrend),
      recentRegistrations: toRecentRegistrations(
        userAnalytics.recentRegistrations
      ),
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
    ideaAnalytics: {
      totalIdeas: toNumber(ideaAnalytics.totalIdeas),
      ideasSubmittedInRange: toNumber(ideaAnalytics.ideasSubmittedInRange),
      pendingIdeas: toNumber(ideaAnalytics.pendingIdeas),
      approvedIdeas: toNumber(ideaAnalytics.approvedIdeas),
      hiddenIdeas: toNumber(ideaAnalytics.hiddenIdeas),
      plannedIdeas: toNumber(ideaAnalytics.plannedIdeas),
      inProgressIdeas: toNumber(ideaAnalytics.inProgressIdeas),
      doneIdeas: toNumber(ideaAnalytics.doneIdeas),
      rejectedIdeas: toNumber(ideaAnalytics.rejectedIdeas),
      duplicateIdeas: toNumber(ideaAnalytics.duplicateIdeas),
      totalVotes: toNumber(ideaAnalytics.totalVotes),
      averageVotesPerIdea: toNumber(ideaAnalytics.averageVotesPerIdea),
      ideasTrend: toTrendPoints(ideaAnalytics.ideasTrend),
      statusRatio: toRatioPoints(ideaAnalytics.statusRatio),
      moderationRatio: toRatioPoints(ideaAnalytics.moderationRatio),
      topVotedIdeas: toTopIdeas(ideaAnalytics.topVotedIdeas),
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
    const [eventsResult, profilesResult, ideasResult] = await Promise.allSettled([
      getEvents(),
      supabase
        .from("profiles")
        .select(
          "id, full_name, avatar_url, country, city, created_at, rating_placement_completed_at, competitive_rating"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("feature_requests")
        .select(
          "id, title, status, moderation_status, vote_count, created_at"
        )
        .order("vote_count", { ascending: false }),
    ]);

    let nextData = base;

    if (eventsResult.status === "fulfilled") {
      nextData = buildEventDrivenAnalytics(nextData, eventsResult.value, filterKey);
    } else {
      console.error(
        "Could not refresh event-driven admin analytics",
        eventsResult.reason
      );
    }

    if (profilesResult.status === "fulfilled") {
      const { data: profiles, error: profilesError } = profilesResult.value;

      if (profilesError) {
        console.error(
          "Could not refresh user-driven admin analytics",
          profilesError
        );
      } else {
        nextData = buildUserDrivenAnalytics(
          nextData,
          (profiles ?? []) as ProfileAnalyticsRow[]
        );
      }
    } else {
      console.error(
        "Could not refresh user-driven admin analytics",
        profilesResult.reason
      );
    }

    if (ideasResult.status === "fulfilled") {
      const { data: ideas, error: ideasError } = ideasResult.value;

      if (ideasError) {
        console.error("Could not refresh idea admin analytics", ideasError);
      } else {
        nextData = buildIdeaAnalytics(
          nextData,
          (ideas ?? []) as FeatureRequestAnalyticsRow[],
          filterKey
        );
      }
    } else {
      console.error(
        "Could not refresh idea admin analytics",
        ideasResult.reason
      );
    }

    return nextData;
  } catch (refreshError) {
    console.error("Could not refresh admin analytics", refreshError);
    return base;
  }
}
