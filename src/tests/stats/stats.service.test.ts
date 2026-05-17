import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStatsData } from "../../features/stats/services/stats.service";

const { mockRpc } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
  supabase: {
    rpc: mockRpc,
  },
}));

describe("stats.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should map admin analytics returned by the rpc", async () => {
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
    expect(result.matchAnalytics.totalMatches).toBe(12);
    expect(result.engagementAnalytics.averagePlayersPerEvent).toBe(3.4);
    expect(result.rankingAnalytics.averageRating).toBe(1032.4);
    expect(result.rankingAnalytics.highestRatedPlayers[0]?.fullName).toBe("Marta");
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
  });

  it("should throw when the rpc fails", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: new Error("Analytics failed"),
    });

    await expect(getStatsData("all_time")).rejects.toThrow("Analytics failed");
  });
});
