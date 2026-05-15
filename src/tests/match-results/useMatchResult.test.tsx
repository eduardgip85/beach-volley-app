import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useMatchResult } from "../../features/match-results/hooks/useMatchResult";
import type { MatchResult } from "../../features/match-results/types/matchResult.types";

const {
    mockGetMatchResultByEventId,
    mockCreateMatchResult,
    mockUpdateMatchResult,
    mockAcceptMatchResult,
    mockGetResultValidationEligibility,
    mockRejectMatchResult,
} = vi.hoisted(() => ({
    mockGetMatchResultByEventId: vi.fn(),
    mockCreateMatchResult: vi.fn(),
    mockUpdateMatchResult: vi.fn(),
    mockAcceptMatchResult: vi.fn(),
    mockGetResultValidationEligibility: vi.fn(),
    mockRejectMatchResult: vi.fn(),
}));

vi.mock("../../features/match-results/services/matchResults.service", () => ({
    getMatchResultByEventId: mockGetMatchResultByEventId,
    createMatchResult: mockCreateMatchResult,
    updateMatchResult: mockUpdateMatchResult,
    acceptMatchResult: mockAcceptMatchResult,
    getResultValidationEligibility: mockGetResultValidationEligibility,
    rejectMatchResult: mockRejectMatchResult,
}));

function createMatchResult(overrides: Partial<MatchResult> = {}): MatchResult {
    return {
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
        ],
        ...overrides,
    };
}

describe("useMatchResult", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetResultValidationEligibility.mockResolvedValue(false);
    });

    it("does not load results for non-match events", async () => {
        const { result } = renderHook(() =>
            useMatchResult("event-1", {
                eventType: "open_play",
                currentUserId: "user-1",
                isEventManager: true,
            })
        );

        expect(result.current.loading).toBe(false);
        expect(result.current.matchResult).toBeNull();
        expect(result.current.canManageResult).toBe(false);
        expect(mockGetMatchResultByEventId).not.toHaveBeenCalled();
    });

    it("loads an existing match result for match events", async () => {
        mockGetMatchResultByEventId.mockResolvedValue(createMatchResult());

        const { result } = renderHook(() =>
            useMatchResult("event-1", {
                eventType: "match",
                currentUserId: "user-1",
                isEventManager: true,
            })
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.matchResult?.id).toBe("result-1");
        expect(result.current.sets).toEqual([
            {
                setNumber: 1,
                teamAScore: 21,
                teamBScore: 18,
            },
        ]);
    });

    it("lets the manager add and remove sets", () => {
        const { result } = renderHook(() =>
            useMatchResult("event-1", {
                eventType: "match",
                currentUserId: "user-1",
                isEventManager: true,
            })
        );

        act(() => {
            result.current.addSet();
        });

        expect(result.current.sets).toHaveLength(2);
        expect(result.current.sets[1].setNumber).toBe(2);

        act(() => {
            result.current.removeSet(0);
        });

        expect(result.current.sets).toHaveLength(1);
        expect(result.current.sets[0].setNumber).toBe(1);
    });

    it("creates a match result with pending validation", async () => {
        const createdResult = createMatchResult();
        mockGetMatchResultByEventId.mockResolvedValue(null);
        mockCreateMatchResult.mockResolvedValue(createdResult);

        const { result } = renderHook(() =>
            useMatchResult("event-1", {
                eventType: "match",
                currentUserId: "user-1",
                isEventManager: true,
            })
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.updateSet(0, "teamAScore", 21);
            result.current.updateSet(0, "teamBScore", 19);
        });

        await act(async () => {
            await result.current.submitResult();
        });

        expect(mockCreateMatchResult).toHaveBeenCalledWith("event-1", "user-1", [
            {
                setNumber: 1,
                teamAScore: 21,
                teamBScore: 19,
            },
        ]);
        expect(result.current.matchResult?.validationStatus).toBe("pending");
    });

    it("allows eligible non-creator users to validate pending results", async () => {
        mockGetMatchResultByEventId.mockResolvedValue(createMatchResult());
        mockGetResultValidationEligibility.mockResolvedValue(true);
        mockAcceptMatchResult.mockResolvedValue(
            createMatchResult({
                validationStatus: "accepted",
                validatedBy: "user-2",
            })
        );

        const { result } = renderHook(() =>
            useMatchResult("event-1", {
                eventType: "match",
                currentUserId: "user-2",
                validationContextKey: "user-1:team_a:joined|user-2:team_b:joined",
            })
        );

        await waitFor(() => {
            expect(result.current.canValidateResult).toBe(true);
        });

        await act(async () => {
            await result.current.validateResult();
        });

        expect(mockAcceptMatchResult).toHaveBeenCalledWith("result-1", "user-2");
        expect(result.current.matchResult?.validationStatus).toBe("accepted");
    });

    it("locks result management after validation is accepted", async () => {
        mockGetMatchResultByEventId.mockResolvedValue(
            createMatchResult({
                validationStatus: "accepted",
                validatedBy: "user-3",
            })
        );

        const { result } = renderHook(() =>
            useMatchResult("event-1", {
                eventType: "match",
                currentUserId: "user-1",
                isEventManager: true,
            })
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.canManageResult).toBe(false);
    });
});
