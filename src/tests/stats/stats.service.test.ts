import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStatsData } from "../../features/stats/services/stats.service";

const { mockRpc, mockGetEvents, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockGetEvents: vi.fn(),
  mockFrom: vi.fn(),
}));

let profilesQueryResult: { data: unknown[] | null; error: Error | null } = {
  data: [],
  error: null,
};
let featureRequestsQueryResult: { data: unknown[] | null; error: Error | null } = {
  data: [],
  error: null,
};

mockFrom.mockImplementation((tableName: string) => ({
  select: vi.fn(() => ({
    order: vi.fn(() =>
      Promise.resolve(
        tableName === "feature_requests"
          ? featureRequestsQueryResult
          : profilesQueryResult
      )
    ),
  })),
}));

vi.mock("../../config/supabase", () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
  },
}));

vi.mock("../../features/events/services/events.service", () => ({
  getEvents: mockGetEvents,
}));

describe("stats.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEvents.mockResolvedValue([]);
    profilesQueryResult = {
      data: [],
      error: null,
    };
    featureRequestsQueryResult = {
      data: [],
      error: null,
    };
  });

  it("should map admin analytics returned by the rpc", async () => {
    mockGetEvents.mockRejectedValueOnce(new Error("Events unavailable"));

    mockRpc.mockResolvedValue({
      data: {
        metadata: {
          filterKey: "last_30_days",
          generatedAt: "2026-05-17T18:00:00.000Z",
        },
        userAnalytics: {
          totalUsers: 18,
          activeUsers: 9,
          newUsersWeek: 4,
          newUsersMonth: 7,
          verifiedEquipmentUsers: 5,
          competitiveUsers: 8,
          newUsersTrend: [{ label: "Week of 12 May", count: 3 }],
        },
        matchAnalytics: {
          totalMatches: 12,
          casualMatches: 7,
          competitiveMatches: 5,
          publicMatches: 9,
          privateMatches: 3,
          matchesCompleted: 10,
          cancelledMatches: 1,
          eventsTrend: [{ label: "Week of 12 May", count: 6 }],
          formatRatio: [
            { name: "Casual", value: 7 },
            { name: "Competitive", value: 5 },
          ],
          visibilityRatio: [
            { name: "Public", value: 9 },
            { name: "Private", value: 3 },
          ],
        },
        engagementAnalytics: {
          averagePlayersPerEvent: 3.4,
          mostActiveUsers: [
            {
              id: "user-1",
              fullName: "Alex",
              avatarUrl: null,
              activityCount: 8,
            },
          ],
          mostActiveLocations: [
            { locationName: "Barceloneta", eventsCount: 5 },
          ],
          peakActivityDays: [{ day: "Saturday", count: 4 }],
        },
        rankingAnalytics: {
          averageRating: 1032.4,
          highestRatedPlayers: [
            {
              id: "user-2",
              fullName: "Marta",
              avatarUrl: null,
              country: "Spain",
              competitiveRating: 1110,
              wins: 6,
              losses: 2,
            },
          ],
          ratingDistribution: [{ label: "1000 - 1099", count: 7 }],
        },
      },
      error: null,
    });

    const result = await getStatsData("last_30_days");

    expect(mockRpc).toHaveBeenCalledWith("get_admin_analytics", {
      filter_key: "last_30_days",
    });
    expect(result.userAnalytics.totalUsers).toBe(18);
    expect(result.userAnalytics.recentRegistrations).toEqual([]);
    expect(result.matchAnalytics.totalMatches).toBe(12);
    expect(result.engagementAnalytics.averagePlayersPerEvent).toBe(3.4);
    expect(result.rankingAnalytics.averageRating).toBe(1032.4);
    expect(result.rankingAnalytics.highestRatedPlayers[0]?.fullName).toBe("Marta");
    expect(result.ideaAnalytics.totalIdeas).toBe(0);
  });

  it("should recompute match analytics from resolved events when available", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-21T12:00:00.000Z"));

    mockRpc.mockResolvedValue({
      data: {
        metadata: {
          filterKey: "last_30_days",
          generatedAt: "2026-05-21T12:00:00.000Z",
        },
        userAnalytics: {
          totalUsers: 18,
          activeUsers: 9,
          newUsersWeek: 4,
          newUsersMonth: 7,
          verifiedEquipmentUsers: 5,
          competitiveUsers: 8,
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
          averageRating: 1032.4,
          highestRatedPlayers: [],
          ratingDistribution: [],
        },
      },
      error: null,
    });

    mockGetEvents.mockResolvedValue([
      {
        id: "match-1",
        title: "Competitive One",
        description: null,
        type: "match",
        visibility: "public",
        mode: "competitive",
        locationName: "Barceloneta",
        latitude: 0,
        longitude: 0,
        startDate: "2026-05-20T10:00:00.000Z",
        endDate: null,
        maxParticipants: 4,
        status: "cancelled",
        resultValidationStatus: "rejected",
        participantCount: 3,
        imageUrl: null,
        createdBy: "user-1",
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-20T10:00:00.000Z",
      },
      {
        id: "match-2",
        title: "Casual Two",
        description: null,
        type: "match",
        visibility: "private",
        mode: "casual",
        locationName: "Nova Icaria",
        latitude: 0,
        longitude: 0,
        startDate: "2026-05-19T10:00:00.000Z",
        endDate: null,
        maxParticipants: 4,
        status: "completed",
        resultValidationStatus: "accepted",
        participantCount: 4,
        imageUrl: null,
        createdBy: "user-2",
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-19T10:00:00.000Z",
      },
    ]);

    profilesQueryResult = {
      data: [
        {
          id: "user-1",
          full_name: "Andrea",
          avatar_url: null,
          country: "Spain",
          city: "Barcelona",
          created_at: "2026-05-21T08:30:00.000Z",
          rating_placement_completed_at: "2026-05-21T08:40:00.000Z",
          competitive_rating: 2.8,
        },
        {
          id: "user-2",
          full_name: "Jules",
          avatar_url: null,
          country: "France",
          city: "Paris",
          created_at: "2026-05-15T08:30:00.000Z",
          rating_placement_completed_at: null,
          competitive_rating: 2,
        },
      ],
      error: null,
    };
    featureRequestsQueryResult = {
      data: [
        {
          id: "idea-1",
          title: "Tournament brackets",
          status: "planned",
          moderation_status: "approved",
          vote_count: 8,
          created_at: "2026-05-20T08:30:00.000Z",
        },
        {
          id: "idea-2",
          title: "Better chat",
          status: "open",
          moderation_status: "pending",
          vote_count: 2,
          created_at: "2026-04-01T08:30:00.000Z",
        },
      ],
      error: null,
    };

    const result = await getStatsData("last_30_days");

    expect(result.matchAnalytics.totalMatches).toBe(2);
    expect(result.matchAnalytics.competitiveMatches).toBe(1);
    expect(result.matchAnalytics.casualMatches).toBe(1);
    expect(result.matchAnalytics.cancelledMatches).toBe(1);
    expect(result.matchAnalytics.matchesCompleted).toBe(1);
    expect(result.engagementAnalytics.averagePlayersPerEvent).toBe(3.5);
    expect(result.userAnalytics.newUsersToday).toBe(1);
    expect(result.userAnalytics.newUsersWeek).toBe(2);
    expect(result.userAnalytics.newUsersMonth).toBe(2);
    expect(result.userAnalytics.onboardingCompletedUsers).toBe(1);
    expect(result.userAnalytics.onboardingCompletionRate).toBe(50);
    expect(result.userAnalytics.recentRegistrations[0]?.fullName).toBe("Andrea");
    expect(result.ideaAnalytics.totalIdeas).toBe(2);
    expect(result.ideaAnalytics.ideasSubmittedInRange).toBe(1);
    expect(result.ideaAnalytics.pendingIdeas).toBe(1);
    expect(result.ideaAnalytics.approvedIdeas).toBe(1);
    expect(result.ideaAnalytics.totalVotes).toBe(10);
    expect(result.ideaAnalytics.averageVotesPerIdea).toBe(5);
    expect(result.ideaAnalytics.topVotedIdeas[0]?.title).toBe(
      "Tournament brackets"
    );

    vi.useRealTimers();
  });

  it("should return a safe empty shape when the rpc payload is missing", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await getStatsData("last_7_days");

    expect(result.metadata.filterKey).toBe("last_7_days");
    expect(result.userAnalytics.totalUsers).toBe(0);
    expect(result.matchAnalytics.eventsTrend).toEqual([]);
    expect(result.rankingAnalytics.ratingDistribution).toEqual([]);
    expect(result.ideaAnalytics.topVotedIdeas).toEqual([]);
  });

  it("should throw when the rpc fails", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: new Error("Analytics failed"),
    });

    await expect(getStatsData("all_time")).rejects.toThrow("Analytics failed");
  });
});
