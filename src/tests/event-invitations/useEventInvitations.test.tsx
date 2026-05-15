import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEventInvitations } from "../../features/event-invitations/hooks/useEventInvitations";

const {
    mockGetFriends,
    mockGetEventInvitations,
    mockGetMyEventInvitationForEvent,
    mockInviteFriendToEvent,
    mockAcceptEventInvitation,
    mockDeclineEventInvitation,
    mockCancelEventInvitation,
} = vi.hoisted(() => ({
    mockGetFriends: vi.fn(),
    mockGetEventInvitations: vi.fn(),
    mockGetMyEventInvitationForEvent: vi.fn(),
    mockInviteFriendToEvent: vi.fn(),
    mockAcceptEventInvitation: vi.fn(),
    mockDeclineEventInvitation: vi.fn(),
    mockCancelEventInvitation: vi.fn(),
}));

vi.mock("../../features/friends/services/friends.service", () => ({
    getFriends: mockGetFriends,
}));

vi.mock("../../features/event-invitations/services/eventInvitations.service", () => ({
    getEventInvitations: mockGetEventInvitations,
    getMyEventInvitationForEvent: mockGetMyEventInvitationForEvent,
    inviteFriendToEvent: mockInviteFriendToEvent,
    acceptEventInvitation: mockAcceptEventInvitation,
    declineEventInvitation: mockDeclineEventInvitation,
    cancelEventInvitation: mockCancelEventInvitation,
}));

function createInvitation(overrides: Partial<any> = {}) {
    return {
        id: "invitation-1",
        eventId: "event-1",
        inviterId: "user-1",
        inviteeId: "user-2",
        status: "pending",
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
        event: {
            id: "event-1",
            title: "Private Match",
            type: "match",
            mode: "competitive",
            visibility: "private",
            locationName: "Nova Icaria",
            startDate: "2026-05-20T18:00:00.000Z",
            maxParticipants: 4,
            status: "active",
            createdBy: "user-1",
        },
        inviter: {
            id: "user-1",
            fullName: "Alex Player",
            avatarUrl: null,
            role: "player",
            competitiveRating: 1000,
        },
        invitee: {
            id: "user-2",
            fullName: "Maria Costa",
            avatarUrl: null,
            role: "player",
            competitiveRating: 1020,
        },
        ...overrides,
    };
}

describe("useEventInvitations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads invitable friends and a pending invitation for the current event", async () => {
        mockGetEventInvitations.mockResolvedValue([createInvitation()]);
        mockGetFriends.mockResolvedValue([
            {
                id: "user-2",
                fullName: "Maria Costa",
                avatarUrl: null,
                role: "player",
                competitiveRating: 1020,
            },
            {
                id: "user-3",
                fullName: "Pau Beach",
                avatarUrl: null,
                role: "player",
                competitiveRating: 1010,
            },
        ]);
        mockGetMyEventInvitationForEvent.mockResolvedValue(
            createInvitation({
                inviteeId: "user-2",
            })
        );

        const { result } = renderHook(() =>
            useEventInvitations("event-1", {
                currentUserId: "user-2",
                canManageInvitations: true,
            })
        );

        await waitFor(() => {
            expect(result.current.state.loading).toBe(false);
        });

        expect(result.current.state.pendingInvitationForCurrentUser?.id).toBe(
            "invitation-1"
        );
        expect(result.current.state.invitableFriends).toHaveLength(1);
        expect(result.current.state.invitableFriends[0].id).toBe("user-3");
    });

    it("refreshes state after inviting a friend", async () => {
        mockGetEventInvitations
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                createInvitation({
                    inviteeId: "user-3",
                    invitee: {
                        id: "user-3",
                        fullName: "Pau Beach",
                        avatarUrl: null,
                        role: "player",
                        competitiveRating: 1010,
                    },
                }),
            ]);
        mockGetFriends.mockResolvedValue([
            {
                id: "user-3",
                fullName: "Pau Beach",
                avatarUrl: null,
                role: "player",
                competitiveRating: 1010,
            },
        ]);
        mockGetMyEventInvitationForEvent.mockResolvedValue(null);
        mockInviteFriendToEvent.mockResolvedValue(createInvitation());

        const { result } = renderHook(() =>
            useEventInvitations("event-1", {
                currentUserId: "user-1",
                canManageInvitations: true,
            })
        );

        await waitFor(() => {
            expect(result.current.state.loading).toBe(false);
        });

        await act(async () => {
            await result.current.actions.inviteFriend("user-3");
        });

        expect(mockInviteFriendToEvent).toHaveBeenCalledWith("event-1", "user-3");
        expect(result.current.state.eventInvitations).toHaveLength(1);
    });
});
