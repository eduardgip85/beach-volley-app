import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProfileStats } from "../../features/profile/hooks/useProfileStats";

const { mockGetProfileDashboardStats } = vi.hoisted(() => ({
    mockGetProfileDashboardStats: vi.fn(),
}));

vi.mock("../../features/profile/services/profileStats.service", () => ({
    getProfileDashboardStats: mockGetProfileDashboardStats,
}));

describe("useProfileStats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns safe defaults when there is no user id", () => {
        const { result } = renderHook(() => useProfileStats());

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe("");
        expect(result.current.stats).toEqual({
            competitiveRating: 1000,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            competitive: {
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
            },
            casual: {
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
            },
            recentMatches: [],
        });
        expect(mockGetProfileDashboardStats).not.toHaveBeenCalled();
    });

    it("loads profile dashboard stats in a single request", async () => {
        mockGetProfileDashboardStats.mockResolvedValue({
            competitiveRating: 1045,
            matchesPlayed: 12,
            wins: 7,
            losses: 5,
            competitive: {
                matchesPlayed: 6,
                wins: 3,
                losses: 3,
            },
            casual: {
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
            },
            recentMatches: [
                { event: { id: "event-5" }, result: { id: "result-5" }, outcome: "win" },
                { event: { id: "event-4" }, result: { id: "result-4" }, outcome: "loss" },
                { event: { id: "event-3" }, result: { id: "result-3" }, outcome: "win" },
                { event: { id: "event-2" }, result: { id: "result-2" }, outcome: "loss" },
                { event: { id: "event-1" }, result: { id: "result-1" }, outcome: "win" },
            ],
        });

        const { result } = renderHook(() => useProfileStats("user-1"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("");
        expect(result.current.stats.competitiveRating).toBe(1045);
        expect(result.current.stats.matchesPlayed).toBe(12);
        expect(result.current.stats.wins).toBe(7);
        expect(result.current.stats.losses).toBe(5);
        expect(result.current.stats.competitive.matchesPlayed).toBe(6);
        expect(result.current.stats.competitive.wins).toBe(3);
        expect(result.current.stats.competitive.losses).toBe(3);
        expect(result.current.stats.casual.matchesPlayed).toBe(0);
        expect(result.current.stats.recentMatches).toHaveLength(5);
        expect(
            result.current.stats.recentMatches.map((match) => match.event.id)
        ).toEqual(["event-5", "event-4", "event-3", "event-2", "event-1"]);
    });

    it("keeps the recent matches ordering returned by the dashboard rpc", async () => {
        mockGetProfileDashboardStats.mockResolvedValue({
            competitiveRating: 1015,
            matchesPlayed: 3,
            wins: 2,
            losses: 1,
            competitive: {
                matchesPlayed: 2,
                wins: 1,
                losses: 1,
            },
            casual: {
                matchesPlayed: 1,
                wins: 1,
                losses: 0,
            },
            recentMatches: [
                { event: { id: "event-1" }, result: { id: "result-1" }, outcome: "win" },
                { event: { id: "event-2" }, result: { id: "result-2" }, outcome: "loss" },
            ],
        });

        const { result } = renderHook(() => useProfileStats("user-1"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(
            result.current.stats.recentMatches.map((match) => match.event.id)
        ).toEqual(["event-1", "event-2"]);
    });

    it("surfaces a friendly error when the stats request fails", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        mockGetProfileDashboardStats.mockRejectedValue(new Error("boom"));

        const { result } = renderHook(() => useProfileStats("user-1"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("Could not load profile statistics");
        expect(result.current.stats.recentMatches).toEqual([]);

        consoleErrorSpy.mockRestore();
    });
});
