import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPublicProfile } from "../../features/players/services/playerProfile.service";

const {
    mockProfilesSelect,
    mockProfilesEq,
    mockProfilesSingle,
    mockRpc,
} = vi.hoisted(() => ({
    mockProfilesSelect: vi.fn(),
    mockProfilesEq: vi.fn(),
    mockProfilesSingle: vi.fn(),
    mockRpc: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        rpc: mockRpc,
        from: vi.fn((table: string) => {
            if (table === "profiles") {
                return {
                    select: mockProfilesSelect,
                };
            }

            throw new Error(`Unexpected table: ${table}`);
        }),
    },
}));

describe("playerProfile.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockProfilesSelect.mockReturnValue({
            eq: mockProfilesEq,
        });
        mockProfilesEq.mockReturnValue({
            single: mockProfilesSingle,
        });
    });

    it("returns a safe public profile with private or public match summaries only", async () => {
        mockProfilesSingle.mockResolvedValue({
            data: {
                id: "user-2",
                full_name: "Maria Costa",
                username: "maria",
                avatar_url: null,
                country: "Spain",
                has_ball: true,
                has_net: false,
                competitive_rating: 1030,
                matches_played: 12,
                wins: 7,
                losses: 5,
                profile_visibility: "public",
                show_rating: true,
                show_stats: true,
            },
            error: null,
        });

        mockRpc.mockResolvedValue({
            data: [],
            error: null,
        });
        mockRpc
            .mockResolvedValueOnce({
                data: [
                    {
                        event_id: "event-1",
                        title: "Private Competitive Match",
                        start_date: "2026-05-15T18:00:00.000Z",
                        mode: "competitive",
                        winning_team: "team_a",
                        player_team: "team_a",
                        sets: [
                            {
                                setNumber: 1,
                                teamAScore: 21,
                                teamBScore: 17,
                            },
                        ],
                    },
                ],
                error: null,
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        mode: "competitive",
                        matches_played: 8,
                        wins: 5,
                        losses: 3,
                    },
                    {
                        mode: "casual",
                        matches_played: 4,
                        wins: 2,
                        losses: 2,
                    },
                ],
                error: null,
            });

        const result = await getPublicProfile("user-2");

        expect(result).toMatchObject({
            id: "user-2",
            fullName: "Maria Costa",
            username: "maria",
            avatarUrl: null,
            country: "Spain",
            hasBall: true,
            hasNet: false,
            competitiveRating: 1030,
            matchesPlayed: 12,
            wins: 7,
            losses: 5,
            profileVisibility: "public",
            showRating: true,
            showStats: true,
        });
        expect(mockRpc).toHaveBeenCalledWith("get_public_player_match_summaries", {
            target_user_id: "user-2",
        });
        expect(mockRpc).toHaveBeenCalledWith("get_public_player_mode_stats", {
            target_user_id: "user-2",
        });
        expect(result.competitive).toEqual({
            matchesPlayed: 8,
            wins: 5,
            losses: 3,
        });
        expect(result.casual).toEqual({
            matchesPlayed: 4,
            wins: 2,
            losses: 2,
        });
        expect(result.recentMatches).toHaveLength(1);
        expect(result.recentMatches[0]).toMatchObject({
            eventId: "event-1",
            title: "Private Competitive Match",
            outcome: "win",
            mode: "competitive",
        });
    });

    it("skips public stats queries when the player hides statistics", async () => {
        mockProfilesSingle.mockResolvedValue({
            data: {
                id: "user-3",
                full_name: "Private Player",
                username: null,
                avatar_url: null,
                country: null,
                has_ball: false,
                has_net: false,
                competitive_rating: 1000,
                matches_played: 0,
                wins: 0,
                losses: 0,
                profile_visibility: "public",
                show_rating: false,
                show_stats: false,
            },
            error: null,
        });

        const result = await getPublicProfile("user-3");

        expect(result.showStats).toBe(false);
        expect(result.showRating).toBe(false);
        expect(result.recentMatches).toEqual([]);
        expect(mockRpc).not.toHaveBeenCalled();
    });
});
