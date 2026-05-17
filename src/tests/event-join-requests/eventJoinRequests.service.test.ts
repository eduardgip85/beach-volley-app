import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    acceptEventJoinRequest,
    getMyEventJoinRequests,
    requestToJoinPrivateEvent,
} from "../../features/event-join-requests/services/eventJoinRequests.service";

const mocks = vi.hoisted(() => ({
    mockGetCurrentProfile: vi.fn(),
    mockIsUserRegistered: vi.fn(),
    mockRegisterToEvent: vi.fn(),
    mockJoinMatch: vi.fn(),
    mockGetEventRegistrationsCount: vi.fn(),
    mockEventsSelect: vi.fn(),
    mockEventsEq: vi.fn(),
    mockEventsSingle: vi.fn(),
    mockRequestsSelect: vi.fn(),
    mockRequestsEq: vi.fn(),
    mockRequestsOrder: vi.fn(),
    mockRequestsSingle: vi.fn(),
    mockRequestsMaybeSingle: vi.fn(),
    mockRequestsIn: vi.fn(),
    mockRequestsInsert: vi.fn(),
    mockRequestsInsertSelect: vi.fn(),
    mockRequestsUpdate: vi.fn(),
    mockRequestsUpdateEq: vi.fn(),
    mockRequestsUpdateSelect: vi.fn(),
    mockMatchResultsSelect: vi.fn(),
    mockMatchResultsEq: vi.fn(),
    mockMatchResultsMaybeSingle: vi.fn(),
}));

vi.mock("../../features/auth/services/auth.service", () => ({
    getCurrentProfile: mocks.mockGetCurrentProfile,
}));

vi.mock("../../features/registrations/services/registrations.service", () => ({
    getEventRegistrationsCount: mocks.mockGetEventRegistrationsCount,
    isUserRegistered: mocks.mockIsUserRegistered,
    registerToEvent: mocks.mockRegisterToEvent,
}));

vi.mock("../../features/match-players/services/matchPlayers.service", () => ({
    joinMatch: mocks.mockJoinMatch,
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        from: vi.fn((table: string) => {
            if (table === "events") {
                return {
                    select: mocks.mockEventsSelect,
                };
            }

            if (table === "event_join_requests") {
                return {
                    select: mocks.mockRequestsSelect,
                    insert: mocks.mockRequestsInsert,
                    update: mocks.mockRequestsUpdate,
                };
            }

            if (table === "match_results") {
                return {
                    select: mocks.mockMatchResultsSelect,
                };
            }

            throw new Error(`Unexpected table: ${table}`);
        }),
    },
}));

const eventRow = {
    id: "event-1",
    title: "Private Match",
    type: "match",
    mode: "competitive",
    visibility: "private",
    location_name: "Nova Icaria",
    start_date: "2026-05-20T18:00:00.000Z",
    max_participants: 4,
    status: "active",
    created_by: "creator-1",
};

const requestRow = {
    id: "request-1",
    event_id: "event-1",
    requester_id: "user-2",
    status: "pending",
    created_at: "2026-05-15T10:00:00.000Z",
    updated_at: "2026-05-15T10:00:00.000Z",
    event: eventRow,
    requester: {
        id: "user-2",
        full_name: "Maria Costa",
        email: "maria@test.com",
        avatar_url: null,
    },
};

describe("eventJoinRequests.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.mockGetCurrentProfile.mockResolvedValue({
            id: "user-2",
            role: "player",
        });

        mocks.mockEventsSelect.mockReturnValue({
            eq: mocks.mockEventsEq,
        });

        mocks.mockEventsEq.mockReturnValue({
            single: mocks.mockEventsSingle,
        });

        mocks.mockRequestsSelect.mockReturnValue({
            eq: mocks.mockRequestsEq,
        });

        mocks.mockRequestsEq.mockReturnValue({
            order: mocks.mockRequestsOrder,
            single: mocks.mockRequestsSingle,
            eq: mocks.mockRequestsEq,
            in: mocks.mockRequestsIn,
        });

        mocks.mockRequestsIn.mockReturnValue({
            order: mocks.mockRequestsOrder,
        });

        mocks.mockRequestsOrder.mockReturnValue({
            maybeSingle: mocks.mockRequestsMaybeSingle,
        });

        mocks.mockRequestsInsert.mockReturnValue({
            select: mocks.mockRequestsInsertSelect,
        });

        mocks.mockRequestsInsertSelect.mockReturnValue({
            single: mocks.mockRequestsSingle,
        });

        mocks.mockRequestsUpdate.mockReturnValue({
            eq: mocks.mockRequestsUpdateEq,
        });

        mocks.mockRequestsUpdateEq.mockReturnValue({
            select: mocks.mockRequestsUpdateSelect,
        });

        mocks.mockRequestsUpdateSelect.mockReturnValue({
            single: mocks.mockRequestsSingle,
        });

        mocks.mockRequestsMaybeSingle.mockResolvedValue({
            data: null,
            error: null,
        });

        mocks.mockMatchResultsSelect.mockReturnValue({
            eq: mocks.mockMatchResultsEq,
        });

        mocks.mockMatchResultsEq.mockReturnValue({
            eq: mocks.mockMatchResultsEq,
            maybeSingle: mocks.mockMatchResultsMaybeSingle,
        });

        mocks.mockMatchResultsMaybeSingle.mockResolvedValue({
            data: null,
            error: null,
        });
    });

    it("returns my private event join requests", async () => {
        mocks.mockRequestsOrder.mockResolvedValue({
            data: [requestRow],
            error: null,
        });

        const result = await getMyEventJoinRequests("user-2");

        expect(mocks.mockRequestsEq).toHaveBeenCalledWith("requester_id", "user-2");
        expect(result).toHaveLength(1);
        expect(result[0].event.title).toBe("Private Match");
    });

    it("creates a private event join request from the direct link flow", async () => {
        mocks.mockEventsSingle.mockResolvedValue({
            data: eventRow,
            error: null,
        });
        mocks.mockIsUserRegistered.mockResolvedValue(false);
        mocks.mockRequestsSingle.mockResolvedValue({
            data: requestRow,
            error: null,
        });

        const result = await requestToJoinPrivateEvent("event-1");

        expect(mocks.mockRequestsInsert).toHaveBeenCalledWith({
            event_id: "event-1",
            requester_id: "user-2",
        });
        expect(result.status).toBe("pending");
    });

    it("reopens a rejected private event join request instead of creating a duplicate", async () => {
        mocks.mockEventsSingle.mockResolvedValue({
            data: eventRow,
            error: null,
        });
        mocks.mockIsUserRegistered.mockResolvedValue(false);
        mocks.mockRequestsMaybeSingle.mockResolvedValue({
            data: {
                ...requestRow,
                status: "rejected",
            },
            error: null,
        });
        mocks.mockRequestsSingle.mockResolvedValue({
            data: {
                ...requestRow,
                status: "pending",
            },
            error: null,
        });

        const result = await requestToJoinPrivateEvent("event-1");

        expect(mocks.mockRequestsInsert).not.toHaveBeenCalled();
        expect(mocks.mockRequestsUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "pending",
            })
        );
        expect(result.status).toBe("pending");
    });

    it("rejects requesting access to a finished event", async () => {
        mocks.mockEventsSingle.mockResolvedValue({
            data: {
                ...eventRow,
                status: "completed",
            },
            error: null,
        });
        mocks.mockIsUserRegistered.mockResolvedValue(false);

        await expect(requestToJoinPrivateEvent("event-1")).rejects.toThrow(
            "This event is already finished"
        );
    });

    it("accepts a pending join request and adds the player to the match", async () => {
        mocks.mockGetCurrentProfile.mockResolvedValue({
            id: "creator-1",
            role: "player",
        });
        mocks.mockRequestsSingle
            .mockResolvedValueOnce({
                data: requestRow,
                error: null,
            })
            .mockResolvedValueOnce({
                data: {
                    ...requestRow,
                    status: "accepted",
                },
                error: null,
            });
        mocks.mockIsUserRegistered.mockResolvedValue(false);
        mocks.mockJoinMatch.mockResolvedValue({
            id: "match-player-1",
        });

        const result = await acceptEventJoinRequest("request-1");

        expect(mocks.mockJoinMatch).toHaveBeenCalledWith("event-1", "user-2");
        expect(mocks.mockRequestsUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "accepted",
            })
        );
        expect(result.status).toBe("accepted");
    });
});
