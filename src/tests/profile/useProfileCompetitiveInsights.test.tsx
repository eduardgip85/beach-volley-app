import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProfileCompetitiveInsights } from "../../features/profile/hooks/useProfileCompetitiveInsights";

const { mockGetProfileCompetitiveInsights } = vi.hoisted(() => ({
    mockGetProfileCompetitiveInsights: vi.fn(),
}));

vi.mock("../../features/profile/services/profileCompetitiveInsights.service", () => ({
    emptyCompetitiveInsights: {
        currentRating: 5,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        averageRating: 5,
        chartPoints: [],
        matchHistory: [],
    },
    getProfileCompetitiveInsights: mockGetProfileCompetitiveInsights,
}));

describe("useProfileCompetitiveInsights", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns safe defaults without a user id", () => {
        const { result } = renderHook(() => useProfileCompetitiveInsights());

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe("");
        expect(result.current.insights.chartPoints).toEqual([]);
        expect(result.current.selectedFilter).toBe("last_10_matches");
    });

    it("loads filtered competitive insights", async () => {
        mockGetProfileCompetitiveInsights.mockResolvedValue({
            currentRating: 5.44,
            matchesPlayed: 5,
            wins: 3,
            losses: 2,
            winRate: 60,
            currentStreak: 1,
            bestStreak: 4,
            averageRating: 5.3,
            chartPoints: [{ id: "history-1", eventId: "event-1", rating: 5.44, ratingDelta: 0.12, date: "2026-05-10T18:00:00.000Z", createdAt: "2026-05-10T20:00:00.000Z", label: "10 May" }],
            matchHistory: [{ historyId: "history-1", eventId: "event-1", title: "City Match", locationName: "Barcelona", startDate: "2026-05-10T18:00:00.000Z", mode: "competitive", outcome: "win", winningTeam: "team_a", playerTeam: "team_a", rating: 5.44, ratingDelta: 0.12, sets: [] }],
        });

        const { result } = renderHook(() =>
            useProfileCompetitiveInsights("user-1")
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockGetProfileCompetitiveInsights).toHaveBeenCalledWith(
            "user-1",
            "last_10_matches"
        );
        expect(result.current.insights.currentRating).toBe(5.44);
        expect(result.current.insights.matchHistory).toHaveLength(1);
    });
});
