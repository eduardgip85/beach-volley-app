export type AnalyticsTimeFilter =
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "all_time";

export interface AnalyticsTrendPoint {
  label: string;
  count: number;
}

export interface AnalyticsRatioPoint {
  name: string;
  value: number;
}

export interface AnalyticsTopUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  activityCount: number;
}

export interface AnalyticsTopLocation {
  locationName: string;
  eventsCount: number;
}

export interface AnalyticsPeakDay {
  day: string;
  count: number;
}

export interface AnalyticsTopRatedPlayer {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  country: string | null;
  competitiveRating: number;
  wins: number;
  losses: number;
}

export interface RatingDistributionBucket {
  label: string;
  count: number;
}

export interface AdminAnalyticsData {
  metadata: {
    filterKey: AnalyticsTimeFilter;
    generatedAt: string;
  };
  userAnalytics: {
    totalUsers: number;
    activeUsers: number;
    newUsersWeek: number;
    newUsersMonth: number;
    verifiedEquipmentUsers: number;
    competitiveUsers: number;
    newUsersTrend: AnalyticsTrendPoint[];
  };
  matchAnalytics: {
    totalMatches: number;
    casualMatches: number;
    competitiveMatches: number;
    publicMatches: number;
    privateMatches: number;
    matchesCompleted: number;
    cancelledMatches: number;
    eventsTrend: AnalyticsTrendPoint[];
    formatRatio: AnalyticsRatioPoint[];
    visibilityRatio: AnalyticsRatioPoint[];
  };
  engagementAnalytics: {
    averagePlayersPerEvent: number;
    mostActiveUsers: AnalyticsTopUser[];
    mostActiveLocations: AnalyticsTopLocation[];
    peakActivityDays: AnalyticsPeakDay[];
  };
  rankingAnalytics: {
    averageRating: number;
    highestRatedPlayers: AnalyticsTopRatedPlayer[];
    ratingDistribution: RatingDistributionBucket[];
  };
}
