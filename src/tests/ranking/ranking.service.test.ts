import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getCompetitiveRanking,
    getRatingHistory,
} from "../../features/ranking/services/ranking.service";

const { mockRpc } = vi.hoisted(() => ({
    mockRpc: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        rpc: mockRpc,
    },
}));

describe("ranking.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads global ranking rows through the ranking rpc", async () => {
        mockRpc.mockResolvedValueOnce({
            data: [
                {
                    ranking_position: 1,
                    profile_id: "user-1",
                    full_name: "Alex Costa",
                    avatar_url: null,
                    country: "Spain",
                    city: "Barcelona",
                    competitive_rating: 1088,
                    matches_played: 10,
                    wins: 7,
                    losses: 3,
                    win_rate: 70,
                    current_streak: 3,
                    best_streak: 5,
                },
            ],
            error: null,
        });

        const result = await getCompetitiveRanking({
            scope: "global",
            limit: 25,
        });

        expect(mockRpc).toHaveBeenCalledWith("get_competitive_ranking", {
            scope: "global",
            target_country: null,
            limit_count: 25,
        });
        expect(result).toEqual([
            {
                position: 1,
                profileId: "user-1",
                fullName: "Alex Costa",
                avatarUrl: null,
                country: "Spain",
                city: "Barcelona",
                competitiveRating: 1088,
                matchesPlayed: 10,
                wins: 7,
                losses: 3,
                winRate: 70,
                currentStreak: 3,
                bestStreak: 5,
            },
        ]);
    });

    it("loads rating history through the history rpc", async () => {
        mockRpc.mockResolvedValueOnce({
            data: [
                {
                    id: "history-1",
                    profile_id: "user-1",
                    rating: 1042,
                    match_id: "match-1",
                    created_at: "2026-05-17T12:00:00.000Z",
                },
            ],
            error: null,
        });

        const result = await getRatingHistory("user-1", 12);

        expect(mockRpc).toHaveBeenCalledWith("get_profile_rating_history", {
            target_user_id: "user-1",
            limit_count: 12,
        });
        expect(result).toEqual([
            {
                id: "history-1",
                profileId: "user-1",
                rating: 1042,
                matchId: "match-1",
                createdAt: "2026-05-17T12:00:00.000Z",
            },
        ]);
    });
});
