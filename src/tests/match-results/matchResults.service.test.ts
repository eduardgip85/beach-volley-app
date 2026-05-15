import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    acceptMatchResult,
    createMatchResult,
    getMatchResultByEventId,
    getResultValidationEligibility,
    updateMatchResult,
} from "../../features/match-results/services/matchResults.service";

const {
    mockGetMatchPlayers,
    mockProfilesSelect,
    mockProfilesEq,
    mockProfilesSingle,
    mockRpc,
    mockApplyRatingForMatchResult,
} = vi.hoisted(() => ({
    mockGetMatchPlayers: vi.fn(),
    mockProfilesSelect: vi.fn(),
    mockProfilesEq: vi.fn(),
    mockProfilesSingle: vi.fn(),
    mockRpc: vi.fn(),
    mockApplyRatingForMatchResult: vi.fn(),
}));

vi.mock("../../features/match-players/services/matchPlayers.service", () => ({
    getMatchPlayers: mockGetMatchPlayers,
}));

vi.mock("../../features/ratings/services/rating.service", () => ({
    applyRatingForMatchResult: mockApplyRatingForMatchResult,
}));

const mockEventsSelect = vi.fn();
const mockEventsUpdate = vi.fn();
const mockEventEq = vi.fn();
const mockEventSingle = vi.fn();
const mockEventUpdateEq = vi.fn();

const mockResultsSelect = vi.fn();
const mockResultsEq = vi.fn();
const mockResultsMaybeSingle = vi.fn();
const mockResultsSingle = vi.fn();
const mockResultsInsert = vi.fn();
const mockResultsInsertSelect = vi.fn();
const mockResultsUpdate = vi.fn();
const mockResultsUpdateEq = vi.fn();
const mockResultsDelete = vi.fn();
const mockResultsDeleteEq = vi.fn();

const mockSetsSelect = vi.fn();
const mockSetsEq = vi.fn();
const mockSetsOrder = vi.fn();
const mockSetsInsert = vi.fn();
const mockSetsDelete = vi.fn();
const mockSetsDeleteEq = vi.fn();

vi.mock("../../config/supabase", () => ({
    supabase: {
        rpc: mockRpc,
        from: vi.fn((table: string) => {
            if (table === "events") {
                return {
                    select: mockEventsSelect,
                    update: mockEventsUpdate,
                };
            }

            if (table === "profiles") {
                return {
                    select: mockProfilesSelect,
                };
            }

            if (table === "match_results") {
                return {
                    select: mockResultsSelect,
                    insert: mockResultsInsert,
                    update: mockResultsUpdate,
                    delete: mockResultsDelete,
                };
            }

            if (table === "match_sets") {
                return {
                    select: mockSetsSelect,
                    insert: mockSetsInsert,
                    delete: mockSetsDelete,
                };
            }

            throw new Error(`Unexpected table: ${table}`);
        }),
    },
}));

const resultRow = {
    id: "result-1",
    event_id: "event-1",
    submitted_by: "user-1",
    winning_team: "team_a",
    validation_status: "pending",
    validated_by: null,
    created_at: "2026-05-01T10:00:00.000Z",
    updated_at: "2026-05-01T10:00:00.000Z",
};

const acceptedResultRow = {
    ...resultRow,
    validation_status: "accepted",
    validated_by: "user-2",
};

const rejectedResultRow = {
    ...resultRow,
    validation_status: "rejected",
    validated_by: "user-2",
};

const setRows = [
    {
        id: "set-1",
        result_id: "result-1",
        set_number: 1,
        team_a_score: 21,
        team_b_score: 18,
    },
    {
        id: "set-2",
        result_id: "result-1",
        set_number: 2,
        team_a_score: 21,
        team_b_score: 16,
    },
];

describe("matchResults.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockEventsSelect.mockReturnValue({
            eq: mockEventEq,
        });

        mockEventEq.mockReturnValue({
            single: mockEventSingle,
        });

        mockEventsUpdate.mockReturnValue({
            eq: mockEventUpdateEq,
        });

        mockEventUpdateEq.mockResolvedValue({
            error: null,
        });

        mockProfilesSelect.mockReturnValue({
            eq: mockProfilesEq,
        });

        mockProfilesEq.mockReturnValue({
            single: mockProfilesSingle,
        });

        mockResultsSelect.mockReturnValue({
            eq: mockResultsEq,
        });

        mockResultsEq.mockReturnValue({
            maybeSingle: mockResultsMaybeSingle,
            single: mockResultsSingle,
        });

        mockResultsInsert.mockReturnValue({
            select: mockResultsInsertSelect,
        });

        mockResultsInsertSelect.mockReturnValue({
            single: mockResultsSingle,
        });

        mockResultsUpdate.mockReturnValue({
            eq: mockResultsUpdateEq,
        });

        mockResultsUpdateEq.mockResolvedValue({
            error: null,
        });

        mockResultsDelete.mockReturnValue({
            eq: mockResultsDeleteEq,
        });

        mockResultsDeleteEq.mockResolvedValue({
            error: null,
        });

        mockSetsSelect.mockReturnValue({
            eq: mockSetsEq,
        });

        mockSetsEq.mockReturnValue({
            order: mockSetsOrder,
        });

        mockSetsInsert.mockResolvedValue({
            error: null,
        });

        mockSetsDelete.mockReturnValue({
            eq: mockSetsDeleteEq,
        });

        mockSetsDeleteEq.mockResolvedValue({
            error: null,
        });

        mockRpc.mockResolvedValue({
            data: null,
            error: null,
        });

        mockApplyRatingForMatchResult.mockResolvedValue({
            applied: true,
            reason: "Competitive Elo rating applied successfully",
        });

        mockGetMatchPlayers.mockResolvedValue([
            {
                id: "player-1",
                eventId: "event-1",
                userId: "user-1",
                team: "team_a",
                status: "joined",
                joinedAt: "2026-05-01T09:00:00.000Z",
                updatedAt: "2026-05-01T09:00:00.000Z",
                profile: {
                    id: "user-1",
                    fullName: "A",
                    email: "a@test.com",
                    avatarUrl: null,
                },
            },
            {
                id: "player-2",
                eventId: "event-1",
                userId: "user-2",
                team: "team_a",
                status: "joined",
                joinedAt: "2026-05-01T09:00:00.000Z",
                updatedAt: "2026-05-01T09:00:00.000Z",
                profile: {
                    id: "user-2",
                    fullName: "B",
                    email: "b@test.com",
                    avatarUrl: null,
                },
            },
            {
                id: "player-3",
                eventId: "event-1",
                userId: "user-3",
                team: "team_b",
                status: "joined",
                joinedAt: "2026-05-01T09:00:00.000Z",
                updatedAt: "2026-05-01T09:00:00.000Z",
                profile: {
                    id: "user-3",
                    fullName: "C",
                    email: "c@test.com",
                    avatarUrl: null,
                },
            },
            {
                id: "player-4",
                eventId: "event-1",
                userId: "user-4",
                team: "team_b",
                status: "joined",
                joinedAt: "2026-05-01T09:00:00.000Z",
                updatedAt: "2026-05-01T09:00:00.000Z",
                profile: {
                    id: "user-4",
                    fullName: "D",
                    email: "d@test.com",
                    avatarUrl: null,
                },
            },
        ]);

        mockProfilesSingle.mockResolvedValue({
            data: { role: "player" },
            error: null,
        });
    });

    it("should return null when no match result exists for an event", async () => {
        mockResultsMaybeSingle.mockResolvedValue({
            data: null,
            error: null,
        });

        const result = await getMatchResultByEventId("event-1");

        expect(result).toBeNull();
    });

    it("should return a mapped match result with ordered sets", async () => {
        mockResultsMaybeSingle.mockResolvedValue({
            data: resultRow,
            error: null,
        });

        mockSetsOrder.mockResolvedValue({
            data: setRows,
            error: null,
        });

        const result = await getMatchResultByEventId("event-1");

        expect(result).toEqual({
            id: "result-1",
            eventId: "event-1",
            submittedBy: "user-1",
            winningTeam: "team_a",
            validationStatus: "pending",
            validatedBy: null,
            createdAt: "2026-05-01T10:00:00.000Z",
            updatedAt: "2026-05-01T10:00:00.000Z",
            sets: [
                {
                    id: "set-1",
                    resultId: "result-1",
                    setNumber: 1,
                    teamAScore: 21,
                    teamBScore: 18,
                },
                {
                    id: "set-2",
                    resultId: "result-1",
                    setNumber: 2,
                    teamAScore: 21,
                    teamBScore: 16,
                },
            ],
        });
    });

    it("should reject creating a result for a non-match event", async () => {
        mockEventSingle.mockResolvedValue({
            data: { type: "open_play" },
            error: null,
        });

        await expect(
            createMatchResult("event-1", "user-1", [
                {
                    setNumber: 1,
                    teamAScore: 21,
                    teamBScore: 19,
                },
            ])
        ).rejects.toThrow("Only match events can have results");

        expect(mockResultsInsert).not.toHaveBeenCalled();
    });

    it("should create a match result and its sets", async () => {
        mockEventSingle.mockResolvedValue({
            data: { type: "match", start_date: new Date().toISOString() },
            error: null,
        });

        mockResultsSingle
            .mockResolvedValueOnce({
                data: resultRow,
                error: null,
            })
            .mockResolvedValueOnce({
                data: resultRow,
                error: null,
            });

        mockSetsOrder.mockResolvedValue({
            data: setRows,
            error: null,
        });

        const result = await createMatchResult("event-1", "user-1", [
            {
                setNumber: 1,
                teamAScore: 21,
                teamBScore: 18,
            },
            {
                setNumber: 2,
                teamAScore: 21,
                teamBScore: 16,
            },
        ]);

            expect(mockResultsInsert).toHaveBeenCalledWith({
                event_id: "event-1",
                submitted_by: "user-1",
                winning_team: "team_a",
            });

        expect(mockSetsInsert).toHaveBeenCalledWith([
            {
                result_id: "result-1",
                set_number: 1,
                team_a_score: 21,
                team_b_score: 18,
            },
            {
                result_id: "result-1",
                set_number: 2,
                team_a_score: 21,
                team_b_score: 16,
            },
        ]);

        expect(result?.sets).toHaveLength(2);
        expect(result.winningTeam).toBe("team_a");
    });

    it("should reset validation state when updating previously rejected result sets", async () => {
        mockEventSingle.mockResolvedValue({
            data: { type: "match", start_date: new Date().toISOString() },
            error: null,
        });

        mockResultsSingle
            .mockResolvedValueOnce({
                data: rejectedResultRow,
                error: null,
            })
            .mockResolvedValueOnce({
                data: resultRow,
                error: null,
            });

        mockSetsOrder.mockResolvedValue({
            data: setRows,
            error: null,
        });

        await updateMatchResult("result-1", [
            {
                setNumber: 1,
                teamAScore: 21,
                teamBScore: 17,
            },
        ]);

        expect(mockSetsDeleteEq).toHaveBeenCalledWith("result_id", "result-1");
        expect(mockSetsInsert).toHaveBeenCalledWith([
            {
                result_id: "result-1",
                set_number: 1,
                team_a_score: 21,
                team_b_score: 17,
            },
        ]);
        expect(mockResultsUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                winning_team: "team_a",
                validation_status: "pending",
                validated_by: null,
            })
        );
    });

    it("should prevent editing a validated result", async () => {
        mockResultsSingle.mockResolvedValueOnce({
            data: {
                ...acceptedResultRow,
                winning_team: "team_a",
            },
            error: null,
        });

        await expect(
            updateMatchResult("result-1", [
                {
                    setNumber: 1,
                    teamAScore: 21,
                    teamBScore: 17,
                },
            ])
        ).rejects.toThrow(
            "This match result is already validated and can no longer be edited"
        );

        expect(mockSetsDelete).not.toHaveBeenCalled();
        expect(mockResultsUpdate).not.toHaveBeenCalled();
    });

    it("should accept a match result", async () => {
        mockEventSingle.mockResolvedValue({
            data: {
                id: "event-1",
                type: "match",
                created_by: "user-1",
                start_date: new Date().toISOString(),
            },
            error: null,
        });

        mockResultsSingle
            .mockResolvedValueOnce({
                data: resultRow,
                error: null,
            })
            .mockResolvedValue({
                data: acceptedResultRow,
                error: null,
            });

        mockSetsOrder.mockResolvedValue({
            data: setRows,
            error: null,
        });

        const result = await acceptMatchResult("result-1", "user-3");

        expect(mockResultsUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                validation_status: "accepted",
                validated_by: "user-3",
            })
        );
        expect(mockRpc).toHaveBeenCalledWith("apply_match_result_profile_stats", {
            target_result_id: "result-1",
        });
        expect(mockApplyRatingForMatchResult).toHaveBeenCalledWith("result-1");
        expect(mockResultsUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                validation_status: "accepted",
                validated_by: "user-3",
            })
        );
        expect(mockResultsSingle).toHaveBeenCalledTimes(2);
        expect(result.validationStatus).toBe("accepted");
        expect(result.validatedBy).toBe("user-2");
    });

    it("only allows submitting results on the same calendar day as the match", async () => {
        mockEventSingle.mockResolvedValue({
            data: { type: "match", start_date: "2099-06-01T10:00:00.000Z" },
            error: null,
        });

        await expect(
            createMatchResult("event-1", "user-1", [
                {
                    setNumber: 1,
                    teamAScore: 21,
                    teamBScore: 18,
                },
            ])
        ).rejects.toThrow(
            "Match results can only be submitted on the same day as the match"
        );
    });

    it("returns false when the submitter tries to validate their own result", async () => {
        mockEventSingle.mockResolvedValue({
            data: { id: "event-1", type: "match", created_by: "user-1" },
            error: null,
        });
        mockResultsMaybeSingle.mockResolvedValue({
            data: resultRow,
            error: null,
        });
        mockSetsOrder.mockResolvedValue({
            data: setRows,
            error: null,
        });

        const eligible = await getResultValidationEligibility("event-1", "user-1");

        expect(eligible).toBe(false);
    });

    it("allows an admin to validate a pending result", async () => {
        mockEventSingle.mockResolvedValue({
            data: { id: "event-1", type: "match", created_by: "user-1" },
            error: null,
        });
        mockResultsMaybeSingle.mockResolvedValue({
            data: resultRow,
            error: null,
        });
        mockSetsOrder.mockResolvedValue({
            data: setRows,
            error: null,
        });
        mockProfilesSingle.mockResolvedValue({
            data: { role: "admin" },
            error: null,
        });

        const eligible = await getResultValidationEligibility("event-1", "admin-1");

        expect(eligible).toBe(true);
    });
});
