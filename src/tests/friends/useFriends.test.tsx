import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFriends } from "../../features/friends/hooks/useFriends";

const {
    mockGetFriendRequests,
    mockSearchUsers,
    mockSendFriendRequest,
    mockAcceptFriendRequest,
    mockRejectFriendRequest,
    mockCancelFriendRequest,
} = vi.hoisted(() => ({
    mockGetFriendRequests: vi.fn(),
    mockSearchUsers: vi.fn(),
    mockSendFriendRequest: vi.fn(),
    mockAcceptFriendRequest: vi.fn(),
    mockRejectFriendRequest: vi.fn(),
    mockCancelFriendRequest: vi.fn(),
}));

vi.mock("../../features/friends/services/friends.service", () => ({
    getFriendRequests: mockGetFriendRequests,
    getFriendsFromRequests: vi.fn((requests, userId) =>
        requests
            .filter((request: any) => request.status === "accepted")
            .map((request: any) =>
                request.requesterId === userId ? request.receiver : request.requester
            )
    ),
    searchUsers: mockSearchUsers,
    sendFriendRequest: mockSendFriendRequest,
    acceptFriendRequest: mockAcceptFriendRequest,
    rejectFriendRequest: mockRejectFriendRequest,
    cancelFriendRequest: mockCancelFriendRequest,
}));

function createRequest(overrides: Partial<any> = {}) {
    return {
        id: "request-1",
        requesterId: "user-2",
        receiverId: "user-1",
        status: "pending",
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
        requester: {
            id: "user-2",
            fullName: "Maria Costa",
            avatarUrl: null,
            role: "player",
            competitiveRating: 1020,
        },
        receiver: {
            id: "user-1",
            fullName: "Alex Player",
            avatarUrl: null,
            role: "player",
            competitiveRating: 1000,
        },
        ...overrides,
    };
}

function createFriend(overrides: Partial<any> = {}) {
    return {
        id: "user-3",
        fullName: "Pau Beach",
        avatarUrl: null,
        role: "player",
        competitiveRating: 1015,
        ...overrides,
    };
}

describe("useFriends", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads requests and friends for the current user", async () => {
        mockGetFriendRequests.mockResolvedValue([
            createRequest({
                status: "accepted",
                requesterId: "user-1",
                receiverId: "user-3",
                receiver: createFriend(),
            }),
        ]);

        const { result } = renderHook(() => useFriends("user-1"));

        await waitFor(() => {
            expect(result.current.state.loading).toBe(false);
        });

        expect(result.current.state.incomingRequests).toHaveLength(0);
        expect(result.current.state.friends).toHaveLength(1);
        expect(result.current.helpers.getRelationshipStatus("user-3")).toBe("friend");
    });

    it("searches users and stores the results", async () => {
        mockGetFriendRequests.mockResolvedValue([]);
        mockSearchUsers.mockResolvedValue([createFriend({ id: "user-9" })]);

        const { result } = renderHook(() => useFriends("user-1"));

        await waitFor(() => {
            expect(result.current.state.loading).toBe(false);
        });

        act(() => {
            result.current.actions.setSearchQuery("pau");
        });

        await act(async () => {
            await result.current.actions.search();
        });

        expect(mockSearchUsers).toHaveBeenCalledWith("pau");
        expect(result.current.state.searchResults).toHaveLength(1);
    });

    it("refreshes data after sending a request", async () => {
        mockGetFriendRequests
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                createRequest({
                    id: "request-2",
                    requesterId: "user-1",
                    receiverId: "user-5",
                    requester: {
                        id: "user-1",
                        fullName: "Alex Player",
                        avatarUrl: null,
                        role: "player",
                        competitiveRating: 1000,
                    },
                    receiver: {
                        id: "user-5",
                        fullName: "New Friend",
                        avatarUrl: null,
                        role: "player",
                        competitiveRating: 1000,
                    },
                }),
            ]);
        mockSendFriendRequest.mockResolvedValue(createRequest());

        const { result } = renderHook(() => useFriends("user-1"));

        await waitFor(() => {
            expect(result.current.state.loading).toBe(false);
        });

        await act(async () => {
            await result.current.actions.sendRequest("user-5");
        });

        expect(mockSendFriendRequest).toHaveBeenCalledWith("user-5");
        expect(result.current.state.outgoingRequests).toHaveLength(1);
    });
});
