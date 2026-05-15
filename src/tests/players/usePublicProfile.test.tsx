import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePublicProfile } from "../../features/players/hooks/usePublicProfile";

const {
    mockGetPublicProfile,
    mockGetFriendRelationship,
    mockRemoveFriend,
    mockSendFriendRequest,
    mockUseAuth,
} = vi.hoisted(() => ({
    mockGetPublicProfile: vi.fn(),
    mockGetFriendRelationship: vi.fn(),
    mockRemoveFriend: vi.fn(),
    mockSendFriendRequest: vi.fn(),
    mockUseAuth: vi.fn(),
}));

vi.mock("../../features/players/services/playerProfile.service", () => ({
    getPublicProfile: mockGetPublicProfile,
}));

vi.mock("../../features/friends/services/friends.service", () => ({
    getFriendRelationship: mockGetFriendRelationship,
    removeFriend: mockRemoveFriend,
    sendFriendRequest: mockSendFriendRequest,
}));

vi.mock("../../features/auth/context/AuthContext", () => ({
    useAuth: mockUseAuth,
}));

describe("usePublicProfile", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue({
            profile: {
                id: "viewer-1",
            },
        });
    });

    it("loads a public profile and derives friend relationship status", async () => {
        mockGetPublicProfile.mockResolvedValue({
            id: "user-2",
            fullName: "Maria Costa",
            avatarUrl: null,
            hasBall: true,
            hasNet: false,
            competitiveRating: 1020,
            matchesPlayed: 10,
            wins: 6,
            losses: 4,
            competitive: {
                matchesPlayed: 6,
                wins: 4,
                losses: 2,
            },
            casual: {
                matchesPlayed: 4,
                wins: 2,
                losses: 2,
            },
            recentMatches: [],
        });
        mockGetFriendRelationship.mockResolvedValue({
            id: "request-1",
            requesterId: "viewer-1",
            receiverId: "user-2",
            status: "pending",
            createdAt: "2026-05-01T10:00:00.000Z",
            updatedAt: "2026-05-01T10:00:00.000Z",
            requester: {
                id: "viewer-1",
                fullName: "Viewer",
                avatarUrl: null,
                role: "player",
                competitiveRating: 1000,
            },
            receiver: {
                id: "user-2",
                fullName: "Maria Costa",
                avatarUrl: null,
                role: "player",
                competitiveRating: 1020,
            },
        });

        const { result } = renderHook(() => usePublicProfile("user-2"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.publicProfile?.fullName).toBe("Maria Costa");
        expect(result.current.relationshipStatus).toBe("outgoing_pending");
        expect(result.current.canSendFriendRequest).toBe(false);
    });

    it("sends a friend request when the profile is not connected yet", async () => {
        mockGetPublicProfile.mockResolvedValue({
            id: "user-2",
            fullName: "Maria Costa",
            avatarUrl: null,
            hasBall: true,
            hasNet: true,
            competitiveRating: 1020,
            matchesPlayed: 10,
            wins: 6,
            losses: 4,
            competitive: {
                matchesPlayed: 6,
                wins: 4,
                losses: 2,
            },
            casual: {
                matchesPlayed: 4,
                wins: 2,
                losses: 2,
            },
            recentMatches: [],
        });
        mockGetFriendRelationship.mockResolvedValue(null);
        mockSendFriendRequest.mockResolvedValue({
            id: "request-1",
        });

        const { result } = renderHook(() => usePublicProfile("user-2"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.actions.sendFriendRequest();
        });

        expect(mockSendFriendRequest).toHaveBeenCalledWith("user-2");
        expect(result.current.relationshipStatus).toBe("outgoing_pending");
    });

    it("removes a friend when the viewed profile is already accepted", async () => {
        mockGetPublicProfile.mockResolvedValue({
            id: "user-2",
            fullName: "Maria Costa",
            avatarUrl: null,
            hasBall: true,
            hasNet: true,
            competitiveRating: 1020,
            matchesPlayed: 10,
            wins: 6,
            losses: 4,
            competitive: {
                matchesPlayed: 6,
                wins: 4,
                losses: 2,
            },
            casual: {
                matchesPlayed: 4,
                wins: 2,
                losses: 2,
            },
            recentMatches: [],
        });
        mockGetFriendRelationship.mockResolvedValue({
            id: "request-1",
            requesterId: "viewer-1",
            receiverId: "user-2",
            status: "accepted",
            createdAt: "2026-05-01T10:00:00.000Z",
            updatedAt: "2026-05-01T10:00:00.000Z",
            requester: {
                id: "viewer-1",
                fullName: "Viewer",
                avatarUrl: null,
                role: "player",
                competitiveRating: 1000,
            },
            receiver: {
                id: "user-2",
                fullName: "Maria Costa",
                avatarUrl: null,
                role: "player",
                competitiveRating: 1020,
            },
        });
        mockRemoveFriend.mockResolvedValue({
            id: "request-1",
        });

        const { result } = renderHook(() => usePublicProfile("user-2"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.actions.removeFriend();
        });

        expect(mockRemoveFriend).toHaveBeenCalledWith("user-2");
        expect(result.current.relationshipStatus).toBe("none");
    });
});
