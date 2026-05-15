import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyRatingForMatchResult } from "../../features/ratings/services/rating.service";

const mockResultsSelect = vi.fn();
const mockResultsEq = vi.fn();
const mockResultsSingle = vi.fn();
const mockResultsUpdate = vi.fn();
const mockResultsUpdateEq = vi.fn();

const mockEventsSelect = vi.fn();
const mockEventsEq = vi.fn();
const mockEventsSingle = vi.fn();

const mockMatchPlayersSelect = vi.fn();
const mockMatchPlayersEq = vi.fn();

const mockProfilesSelect = vi.fn();
const mockProfilesIn = vi.fn();
const mockProfilesUpdate = vi.fn();
const mockProfilesUpdateEq = vi.fn();

vi.mock("../../config/supabase", () => ({
    supabase: {
        from: vi.fn((table: string) => {
            if (table === "match_results") {
                return {
                    select: mockResultsSelect,
                    update: mockResultsUpdate,
                };
            }

            if (table === "events") {
                return {
                    select: mockEventsSelect,
                };
            }

            if (table === "match_players") {
                return {
                    select: mockMatchPlayersSelect,
                };
            }

            if (table === "profiles") {
                return {
                    select: mockProfilesSelect,
                    update: mockProfilesUpdate,
                };
            }

            throw new Error(`Unexpected table: ${table}`);
        }),
    },
}));

describe("rating.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockResultsSelect.mockReturnValue({
            eq: mockResultsEq,
        });
        mockResultsEq.mockReturnValue({
            single: mockResultsSingle,
        });
        mockResultsUpdate.mockReturnValue({
            eq: mockResultsUpdateEq,
        });
        mockResultsUpdateEq.mockResolvedValue({
            error: null,
        });

        mockEventsSelect.mockReturnValue({
            eq: mockEventsEq,
        });
        mockEventsEq.mockReturnValue({
            single: mockEventsSingle,
        });

        mockMatchPlayersSelect.mockReturnValue({
            eq: mockMatchPlayersEq,
        });
        mockMatchPlayersEq.mockResolvedValue({
            data: [
                { user_id: "user-1", team: "team_a", status: "joined" },
                { user_id: "user-2", team: "team_a", status: "joined" },
                { user_id: "user-3", team: "team_b", status: "joined" },
                { user_id: "user-4", team: "team_b", status: "joined" },
            ],
            error: null,
        });

        mockProfilesSelect.mockReturnValue({
            in: mockProfilesIn,
        });
        mockProfilesIn.mockResolvedValue({
            data: [
                { id: "user-1", competitive_rating: 1000, rating_games_played: 0 },
                { id: "user-2", competitive_rating: 1040, rating_games_played: 0 },
                { id: "user-3", competitive_rating: 980, rating_games_played: 0 },
                { id: "user-4", competitive_rating: 1020, rating_games_played: 0 },
            ],
            error: null,
        });

        mockProfilesUpdate.mockReturnValue({
            eq: mockProfilesUpdateEq,
        });
        mockProfilesUpdateEq.mockResolvedValue({
            error: null,
        });
    });

    it("does not apply rating to non-accepted results", async () => {
        mockResultsSingle.mockResolvedValue({
            data: {
                id: "result-1",
                event_id: "event-1",
                winning_team: "team_a",
                validation_status: "pending",
                rating_applied: false,
            },
            error: null,
        });

        const result = await applyRatingForMatchResult("result-1");

        expect(result).toEqual({
            applied: false,
            reason: "Only accepted match results can affect rating",
        });
        expect(mockProfilesUpdate).not.toHaveBeenCalled();
    });

    it("does not apply rating twice", async () => {
        mockResultsSingle.mockResolvedValue({
            data: {
                id: "result-1",
                event_id: "event-1",
                winning_team: "team_a",
                validation_status: "accepted",
                rating_applied: true,
            },
            error: null,
        });

        const result = await applyRatingForMatchResult("result-1");

        expect(result).toEqual({
            applied: false,
            reason: "Rating has already been applied for this match result",
        });
        expect(mockProfilesUpdate).not.toHaveBeenCalled();
    });

    it("does not apply rating to casual matches", async () => {
        mockResultsSingle.mockResolvedValue({
            data: {
                id: "result-1",
                event_id: "event-1",
                winning_team: "team_a",
                validation_status: "accepted",
                rating_applied: false,
            },
            error: null,
        });
        mockEventsSingle.mockResolvedValue({
            data: {
                id: "event-1",
                type: "match",
                mode: "casual",
            },
            error: null,
        });

        const result = await applyRatingForMatchResult("result-1");

        expect(result).toEqual({
            applied: false,
            reason: "Only accepted competitive matches can affect rating",
        });
        expect(mockProfilesUpdate).not.toHaveBeenCalled();
    });

    it("applies Elo to accepted competitive matches and marks the result", async () => {
        mockResultsSingle.mockResolvedValue({
            data: {
                id: "result-1",
                event_id: "event-1",
                winning_team: "team_a",
                validation_status: "accepted",
                rating_applied: false,
            },
            error: null,
        });
        mockEventsSingle.mockResolvedValue({
            data: {
                id: "event-1",
                type: "match",
                mode: "competitive",
            },
            error: null,
        });

        const result = await applyRatingForMatchResult("result-1");

        expect(result).toEqual({
            applied: true,
            reason: "Competitive Elo rating applied successfully",
        });
        expect(mockProfilesUpdate).toHaveBeenCalledTimes(4);
        expect(mockProfilesUpdate).toHaveBeenCalledWith({
            competitive_rating: 1015,
            rating_games_played: 1,
        });
        expect(mockProfilesUpdate).toHaveBeenCalledWith({
            competitive_rating: 965,
            rating_games_played: 1,
        });
        expect(mockResultsUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                rating_applied: true,
                rating_applied_at: expect.any(String),
            })
        );
    });

    it("does not apply rating to open play events", async () => {
        mockResultsSingle.mockResolvedValue({
            data: {
                id: "result-1",
                event_id: "event-1",
                winning_team: "team_a",
                validation_status: "accepted",
                rating_applied: false,
            },
            error: null,
        });
        mockEventsSingle.mockResolvedValue({
            data: {
                id: "event-1",
                type: "open_play",
                mode: null,
            },
            error: null,
        });

        const result = await applyRatingForMatchResult("result-1");

        expect(result).toEqual({
            applied: false,
            reason: "Only accepted competitive matches can affect rating",
        });
    });
});
