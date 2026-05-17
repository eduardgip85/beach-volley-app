import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    acceptEventInvitation,
    getEventInvitations,
    getMyEventInvitationForEvent,
    getMyEventInvitations,
    inviteFriendToEvent,
} from "../../features/event-invitations/services/eventInvitations.service";

const mocks = vi.hoisted(() => ({
    mockGetCurrentProfile: vi.fn(),
    mockGetFriends: vi.fn(),
    mockGetEventRegistrationsCount: vi.fn(),
    mockIsUserRegistered: vi.fn(),
    mockRegisterToEvent: vi.fn(),
    mockJoinMatch: vi.fn(),
    mockEventsSelect: vi.fn(),
    mockEventsEq: vi.fn(),
    mockEventsSingle: vi.fn(),
    mockInvitationsSelect: vi.fn(),
    mockInvitationsEq: vi.fn(),
    mockInvitationsOrder: vi.fn(),
    mockInvitationsInsert: vi.fn(),
    mockInvitationsInsertSelect: vi.fn(),
    mockInvitationsUpdate: vi.fn(),
    mockInvitationsUpdateEq: vi.fn(),
    mockInvitationsSingle: vi.fn(),
}));

vi.mock("../../features/auth/services/auth.service", () => ({
    getCurrentProfile: mocks.mockGetCurrentProfile,
}));

vi.mock("../../features/friends/services/friends.service", () => ({
    getFriends: mocks.mockGetFriends,
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

            if (table === "event_invitations") {
                return {
                    select: mocks.mockInvitationsSelect,
                    insert: mocks.mockInvitationsInsert,
                    update: mocks.mockInvitationsUpdate,
                };
            }

            throw new Error(`Unexpected table: ${table}`);
        }),
    },
}));

const invitationRow = {
    id: "invitation-1",
    event_id: "event-1",
    inviter_id: "user-1",
    invitee_id: "user-2",
    status: "pending",
    created_at: "2026-05-01T10:00:00.000Z",
    updated_at: "2026-05-01T10:00:00.000Z",
    event: {
        id: "event-1",
        title: "Private Match",
        type: "match",
        mode: "competitive",
        visibility: "private",
        location_name: "Nova Icaria",
        start_date: "2026-05-20T18:00:00.000Z",
        max_participants: 4,
        status: "active",
        created_by: "user-1",
    },
    inviter: {
        id: "user-1",
        full_name: "Alex Player",
        email: "alex@test.com",
        avatar_url: null,
        role: "player",
        competitive_rating: 1000,
    },
    invitee: {
        id: "user-2",
        full_name: "Maria Costa",
        email: "maria@test.com",
        avatar_url: null,
        role: "player",
        competitive_rating: 1020,
    },
};

describe("eventInvitations.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.mockGetCurrentProfile.mockResolvedValue({
            id: "user-1",
            role: "player",
        });

        mocks.mockEventsSelect.mockReturnValue({
            eq: mocks.mockEventsEq,
        });

        mocks.mockEventsEq.mockReturnValue({
            single: mocks.mockEventsSingle,
        });

        mocks.mockInvitationsSelect.mockReturnValue({
            eq: mocks.mockInvitationsEq,
        });

        mocks.mockInvitationsEq.mockReturnValue({
            order: mocks.mockInvitationsOrder,
            single: mocks.mockInvitationsSingle,
        });

        mocks.mockInvitationsInsert.mockReturnValue({
            select: mocks.mockInvitationsInsertSelect,
        });

        mocks.mockInvitationsInsertSelect.mockReturnValue({
            single: mocks.mockInvitationsSingle,
        });

        mocks.mockInvitationsUpdate.mockReturnValue({
            eq: mocks.mockInvitationsUpdateEq,
        });

        mocks.mockInvitationsUpdateEq.mockReturnValue({
            select: mocks.mockInvitationsInsertSelect,
        });
    });

    it("returns event invitations for a private event", async () => {
        mocks.mockInvitationsOrder.mockResolvedValue({
            data: [invitationRow],
            error: null,
        });

        const result = await getEventInvitations("event-1");

        expect(result).toHaveLength(1);
        expect(result[0].event.title).toBe("Private Match");
    });

    it("returns invitations received by the current user", async () => {
        mocks.mockInvitationsOrder.mockResolvedValue({
            data: [invitationRow],
            error: null,
        });

        const result = await getMyEventInvitations("user-2");

        expect(result[0].inviteeId).toBe("user-2");
    });

    it("returns only the latest invitation for one event and invitee", async () => {
        const mockSecondEq = vi.fn();
        const mockOrder = vi.fn();
        const mockLimit = vi.fn();

        mocks.mockInvitationsSelect.mockReturnValueOnce({
            eq: mocks.mockInvitationsEq,
        });
        mocks.mockInvitationsEq.mockReturnValueOnce({
            eq: mockSecondEq,
        });
        mockSecondEq.mockReturnValueOnce({
            order: mockOrder,
        });
        mockOrder.mockReturnValueOnce({
            limit: mockLimit,
        });
        mockLimit.mockResolvedValueOnce({
            data: [invitationRow],
            error: null,
        });

        const result = await getMyEventInvitationForEvent("event-1", "user-2");

        expect(result?.id).toBe("invitation-1");
    });

    it("allows the creator to invite a friend to a private event", async () => {
        mocks.mockEventsSingle.mockResolvedValue({
            data: invitationRow.event,
            error: null,
        });
        mocks.mockGetFriends.mockResolvedValue([
            {
                id: "user-2",
                fullName: "Maria Costa",
                email: "maria@test.com",
                avatarUrl: null,
                role: "player",
                competitiveRating: 1020,
            },
        ]);
        mocks.mockIsUserRegistered.mockResolvedValue(false);
        mocks.mockInvitationsOrder.mockResolvedValue({
            data: [],
            error: null,
        });
        mocks.mockInvitationsSingle.mockResolvedValue({
            data: invitationRow,
            error: null,
        });

        const result = await inviteFriendToEvent("event-1", "user-2");

        expect(mocks.mockInvitationsInsert).toHaveBeenCalledWith({
            event_id: "event-1",
            inviter_id: "user-1",
            invitee_id: "user-2",
        });
        expect(result.status).toBe("pending");
    });

    it("rejects inviting a non-friend", async () => {
        mocks.mockEventsSingle.mockResolvedValue({
            data: invitationRow.event,
            error: null,
        });
        mocks.mockGetFriends.mockResolvedValue([]);

        await expect(inviteFriendToEvent("event-1", "user-2")).rejects.toThrow(
            "Only friends can be invited to private events"
        );
    });

    it("rejects inviting players to a finished event", async () => {
        mocks.mockEventsSingle.mockResolvedValue({
            data: {
                ...invitationRow.event,
                status: "completed",
            },
            error: null,
        });

        await expect(inviteFriendToEvent("event-1", "user-2")).rejects.toThrow(
            "This event is already finished"
        );
    });

    it("accepts an invitation and auto-registers the invitee", async () => {
        mocks.mockGetCurrentProfile.mockResolvedValue({
            id: "user-2",
            role: "player",
        });
        mocks.mockInvitationsSingle
            .mockResolvedValueOnce({
                data: invitationRow,
                error: null,
            })
            .mockResolvedValueOnce({
                data: {
                    ...invitationRow,
                    status: "accepted",
                },
                error: null,
            });
        mocks.mockIsUserRegistered.mockResolvedValue(false);
        mocks.mockGetEventRegistrationsCount.mockResolvedValue(1);
        mocks.mockJoinMatch.mockResolvedValue({
            id: "player-1",
        });

        const result = await acceptEventInvitation("invitation-1");

        expect(mocks.mockInvitationsUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "accepted",
            })
        );
        expect(mocks.mockJoinMatch).toHaveBeenCalledWith("event-1", "user-2");
        expect(result.status).toBe("accepted");
    });
});
