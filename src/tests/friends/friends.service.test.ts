import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    acceptFriendRequest,
    cancelFriendRequest,
    getFriendRelationship,
    getFriendRequests,
    getFriends,
    removeFriend,
    rejectFriendRequest,
    searchUsers,
    sendFriendRequest,
} from "../../features/friends/services/friends.service";

const mocks = vi.hoisted(() => ({
    mockAuthGetSession: vi.fn(),
    mockProfilesSelect: vi.fn(),
    mockProfilesIlike: vi.fn(),
    mockProfilesNeq: vi.fn(),
    mockProfilesOrder: vi.fn(),
    mockProfilesLimit: vi.fn(),
    mockFriendRequestsSelect: vi.fn(),
    mockFriendRequestsOr: vi.fn(),
    mockFriendRequestsOrder: vi.fn(),
    mockFriendRequestsInsert: vi.fn(),
    mockFriendRequestsInsertSelect: vi.fn(),
    mockFriendRequestsUpdate: vi.fn(),
    mockFriendRequestsUpdateEq: vi.fn(),
    mockFriendRequestsUpdateOr: vi.fn(),
    mockFriendRequestsUpdateSelect: vi.fn(),
    mockFriendRequestsSingle: vi.fn(),
    mockFriendRequestsSelectEq: vi.fn(),
    mockFriendRequestsSelectOr: vi.fn(),
    mockFriendRequestsMaybeSingle: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        auth: {
            getSession: mocks.mockAuthGetSession,
        },
        from: vi.fn((table: string) => {
            if (table === "profiles") {
                return {
                    select: mocks.mockProfilesSelect,
                };
            }

            if (table === "friend_requests") {
                return {
                    select: mocks.mockFriendRequestsSelect,
                    insert: mocks.mockFriendRequestsInsert,
                    update: mocks.mockFriendRequestsUpdate,
                };
            }

            throw new Error(`Unexpected table: ${table}`);
        }),
    },
}));

const friendProfileRow = {
    id: "user-2",
    full_name: "Maria Costa",
    avatar_url: null,
    role: "player",
    competitive_rating: 1020,
};

const friendRequestRow = {
    id: "request-1",
    requester_id: "user-1",
    receiver_id: "user-2",
    status: "pending",
    created_at: "2026-05-01T10:00:00.000Z",
    updated_at: "2026-05-01T10:00:00.000Z",
    requester: {
        id: "user-1",
        full_name: "Alex Player",
        avatar_url: null,
        role: "player",
        competitive_rating: 1000,
    },
    receiver: friendProfileRow,
};

describe("friends.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.mockProfilesSelect.mockReturnValue({
            ilike: mocks.mockProfilesIlike,
        });

        mocks.mockProfilesIlike.mockReturnValue({
            neq: mocks.mockProfilesNeq,
        });

        mocks.mockProfilesNeq.mockReturnValue({
            order: mocks.mockProfilesOrder,
        });

        mocks.mockProfilesOrder.mockReturnValue({
            limit: mocks.mockProfilesLimit,
        });

        mocks.mockFriendRequestsSelect.mockReturnValue({
            or: mocks.mockFriendRequestsOr,
            eq: mocks.mockFriendRequestsSelectEq,
        });

        mocks.mockFriendRequestsOr.mockReturnValue({
            order: mocks.mockFriendRequestsOrder,
        });

        mocks.mockFriendRequestsSelectEq.mockReturnValue({
            or: mocks.mockFriendRequestsSelectOr,
        });

        mocks.mockFriendRequestsSelectOr.mockReturnValue({
            maybeSingle: mocks.mockFriendRequestsMaybeSingle,
        });

        mocks.mockFriendRequestsInsert.mockReturnValue({
            select: mocks.mockFriendRequestsInsertSelect,
        });

        mocks.mockFriendRequestsInsertSelect.mockReturnValue({
            single: mocks.mockFriendRequestsSingle,
        });

        mocks.mockFriendRequestsUpdate.mockReturnValue({
            eq: mocks.mockFriendRequestsUpdateEq,
        });

        mocks.mockFriendRequestsUpdateEq.mockReturnValue({
            select: mocks.mockFriendRequestsInsertSelect,
            or: mocks.mockFriendRequestsUpdateOr,
        });

        mocks.mockFriendRequestsUpdateOr.mockReturnValue({
            select: mocks.mockFriendRequestsUpdateSelect,
        });

        mocks.mockFriendRequestsUpdateSelect.mockReturnValue({
            single: mocks.mockFriendRequestsSingle,
        });

        mocks.mockAuthGetSession.mockResolvedValue({
            data: {
                session: {
                    user: {
                        id: "user-1",
                    },
                },
            },
            error: null,
        });
    });

    it("searches users excluding the current user", async () => {
        mocks.mockProfilesLimit.mockResolvedValue({
            data: [friendProfileRow],
            error: null,
        });

        const result = await searchUsers("maria");

        expect(mocks.mockProfilesSelect).toHaveBeenCalledWith(
            "id, full_name, avatar_url, role, competitive_rating"
        );
        expect(mocks.mockProfilesIlike).toHaveBeenCalledWith(
            "full_name",
            "%maria%"
        );
        expect(mocks.mockProfilesNeq).toHaveBeenCalledWith("id", "user-1");
        expect(result[0].fullName).toBe("Maria Costa");
    });

    it("returns all requests involving the user", async () => {
        mocks.mockFriendRequestsOrder.mockResolvedValue({
            data: [friendRequestRow],
            error: null,
        });

        const result = await getFriendRequests("user-1");

        expect(mocks.mockFriendRequestsOr).toHaveBeenCalledWith(
            "requester_id.eq.user-1,receiver_id.eq.user-1"
        );
        expect(result[0].receiver.fullName).toBe("Maria Costa");
    });

    it("returns accepted friends as counterpart profiles", async () => {
        mocks.mockFriendRequestsOrder.mockResolvedValue({
            data: [
                {
                    ...friendRequestRow,
                    status: "accepted",
                },
            ],
            error: null,
        });

        const result = await getFriends("user-1");

        expect(result).toEqual([
            {
                id: "user-2",
                fullName: "Maria Costa",
                avatarUrl: null,
                role: "player",
                competitiveRating: 1020,
            },
        ]);
    });

    it("loads only the latest relationship between two users", async () => {
        mocks.mockFriendRequestsOrder.mockReturnValue({
            limit: vi.fn().mockResolvedValue({
                data: [
                    {
                        ...friendRequestRow,
                        status: "accepted",
                    },
                ],
                error: null,
            }),
        });

        const result = await getFriendRelationship("user-1", "user-2");

        expect(result?.status).toBe("accepted");
    });

    it("creates a friend request for the current user", async () => {
        mocks.mockFriendRequestsSingle.mockResolvedValue({
            data: friendRequestRow,
            error: null,
        });

        const result = await sendFriendRequest("user-2");

        expect(mocks.mockFriendRequestsInsert).toHaveBeenCalledWith({
            requester_id: "user-1",
            receiver_id: "user-2",
        });
        expect(result.status).toBe("pending");
    });

    it("shows a friendly error when an active request already exists", async () => {
        mocks.mockFriendRequestsSingle.mockResolvedValue({
            data: null,
            error: {
                code: "23505",
            },
        });

        await expect(sendFriendRequest("user-2")).rejects.toThrow(
            "There is already an active friend request between these users"
        );
    });

    it("accepts, rejects and cancels requests", async () => {
        mocks.mockFriendRequestsSingle
            .mockResolvedValueOnce({
                data: {
                    ...friendRequestRow,
                    status: "accepted",
                },
                error: null,
            })
            .mockResolvedValueOnce({
                data: {
                    ...friendRequestRow,
                    status: "rejected",
                },
                error: null,
            })
            .mockResolvedValueOnce({
                data: {
                    ...friendRequestRow,
                    status: "cancelled",
                },
                error: null,
            });

        const accepted = await acceptFriendRequest("request-1");
        const rejected = await rejectFriendRequest("request-1");
        const cancelled = await cancelFriendRequest("request-1");

        expect(mocks.mockFriendRequestsUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "accepted",
            })
        );
        expect(accepted.status).toBe("accepted");
        expect(rejected.status).toBe("rejected");
        expect(cancelled.status).toBe("cancelled");
    });

    it("removes an accepted friendship using a separate removed status", async () => {
        mocks.mockFriendRequestsSingle.mockResolvedValue({
                data: {
                    ...friendRequestRow,
                    status: "removed",
                },
                error: null,
            });

        const result = await removeFriend("user-2");

        expect(mocks.mockFriendRequestsUpdateEq).toHaveBeenCalledWith(
            "status",
            "accepted"
        );
        expect(result.status).toBe("removed");
    });
});
