import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProfileCompetitiveInsights } from "../../features/profile/services/profileCompetitiveInsights.service";

const { mockRpc } = vi.hoisted(() => ({
    mockRpc: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        rpc: mockRpc,
    },
}));

describe("profileCompetitiveInsights.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads competitive insights through the profile rpc", async () => {
        mockRpc.mockResolvedValue({
            data: {
                currentRating: 2.32,
                matchesPlayed: 6,
                wins: 4,
                losses: 2,
                winRate: 66.7,
                currentStreak: 2,
                bestStreak: 3,
                averageRating: 2.19,
                chartPoints: [
                    {
                        id: "history-1",
                        eventId: "event-1",
                        rating: 2.16,
                        ratingDelta: 0.16,
                        date: "2026-05-01T18:00:00.000Z",
                        createdAt: "2026-05-01T20:00:00.000Z",
                        label: "01 May",
                    },
                ],
                matchHistory: [
                    {
                        historyId: "history-1",
                        eventId: "event-1",
                        title: "Sunset Match",
                        locationName: "Nova Icaria",
                        startDate: "2026-05-01T18:00:00.000Z",
                        mode: "competitive",
                        outcome: "win",
                        winningTeam: "team_a",
                        playerTeam: "team_a",
                        rating: 2.16,
                        ratingDelta: 0.16,
                        sets: [
                            {
                                setNumber: 1,
                                teamAScore: 21,
                                teamBScore: 18,
                            },
                        ],
                    },
                ],
            },
            error: null,
        });

        const result = await getProfileCompetitiveInsights(
            "user-1",
            "last_10_matches"
        );

        expect(mockRpc).toHaveBeenCalledWith("get_profile_competitive_insights", {
            target_user_id: "user-1",
            filter_key: "last_10_matches",
        });
        expect(result.currentRating).toBe(2.32);
        expect(result.averageRating).toBe(2.19);
        expect(result.chartPoints[0].ratingDelta).toBe(0.16);
        expect(result.matchHistory[0].sets[0].teamAScore).toBe(21);
    });

    it("builds a fallback chart point when a single competitive legacy match has no rating history row", async () => {
        mockRpc.mockResolvedValue({
            data: {
                currentRating: 2.15,
                matchesPlayed: 1,
                wins: 1,
                losses: 0,
                winRate: 100,
                currentStreak: 1,
                bestStreak: 1,
                averageRating: 2.15,
                chartPoints: [],
                matchHistory: [
                    {
                        historyId: "legacy-event-1",
                        eventId: "event-legacy-1",
                        title: "Legacy Competitive Match",
                        locationName: "Nova Icaria",
                        startDate: "2026-05-10T18:00:00.000Z",
                        mode: "competitive",
                        outcome: "win",
                        winningTeam: "team_a",
                        playerTeam: "team_a",
                        rating: null,
                        ratingDelta: null,
                        sets: [],
                    },
                ],
            },
            error: null,
        });

        const result = await getProfileCompetitiveInsights(
            "user-1",
            "last_10_matches"
        );

        expect(result.chartPoints).toHaveLength(1);
        expect(result.chartPoints[0]).toMatchObject({
            eventId: "event-legacy-1",
            rating: 2.15,
            ratingDelta: 0.15,
        });
        expect(result.matchHistory[0].rating).toBe(2.15);
        expect(result.matchHistory[0].ratingDelta).toBe(0.15);
    });
});
