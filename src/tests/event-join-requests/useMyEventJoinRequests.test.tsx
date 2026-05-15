import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyEventJoinRequests } from "../../features/event-join-requests/hooks/useMyEventJoinRequests";

const { mockGetMyEventJoinRequests } = vi.hoisted(() => ({
    mockGetMyEventJoinRequests: vi.fn(),
}));

vi.mock("../../features/event-join-requests/services/eventJoinRequests.service", () => ({
    getMyEventJoinRequests: mockGetMyEventJoinRequests,
}));

describe("useMyEventJoinRequests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads only pending private event requests for active upcoming events", async () => {
        mockGetMyEventJoinRequests.mockResolvedValue([
            {
                id: "request-1",
                eventId: "event-1",
                requesterId: "user-1",
                status: "pending",
                createdAt: "2026-05-15T10:00:00.000Z",
                updatedAt: "2026-05-15T10:00:00.000Z",
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
                    createdBy: "creator-1",
                },
                requester: {
                    id: "user-1",
                    fullName: "Alex Player",
                    email: "alex@test.com",
                    avatarUrl: null,
                },
            },
            {
                id: "request-2",
                eventId: "event-2",
                requesterId: "user-1",
                status: "accepted",
                createdAt: "2026-05-15T11:00:00.000Z",
                updatedAt: "2026-05-15T11:00:00.000Z",
                event: {
                    id: "event-2",
                    title: "Accepted Request",
                    type: "open_play",
                    mode: null,
                    visibility: "private",
                    locationName: "Bogatell",
                    startDate: "2099-05-22T18:00:00.000Z",
                    maxParticipants: 10,
                    status: "active",
                    createdBy: "creator-2",
                },
                requester: {
                    id: "user-1",
                    fullName: "Alex Player",
                    email: "alex@test.com",
                    avatarUrl: null,
                },
            },
            {
                id: "request-3",
                eventId: "event-2",
                requesterId: "user-1",
                status: "rejected",
                createdAt: "2026-05-15T11:00:00.000Z",
                updatedAt: "2026-05-15T11:00:00.000Z",
                event: {
                    id: "event-2",
                    title: "Private Open Play",
                    type: "open_play",
                    mode: null,
                    visibility: "private",
                    locationName: "Bogatell",
                    startDate: "2026-05-22T18:00:00.000Z",
                    maxParticipants: 10,
                    status: "active",
                    createdBy: "creator-2",
                },
                requester: {
                    id: "user-1",
                    fullName: "Alex Player",
                    email: "alex@test.com",
                    avatarUrl: null,
                },
            },
            {
                id: "request-4",
                eventId: "event-4",
                requesterId: "user-1",
                status: "pending",
                createdAt: "2026-05-15T11:00:00.000Z",
                updatedAt: "2026-05-15T11:00:00.000Z",
                event: {
                    id: "event-4",
                    title: "Completed Match",
                    type: "match",
                    mode: "competitive",
                    visibility: "private",
                    locationName: "Nova Icaria",
                    startDate: "2099-05-22T18:00:00.000Z",
                    maxParticipants: 4,
                    status: "completed",
                    createdBy: "creator-4",
                },
                requester: {
                    id: "user-1",
                    fullName: "Alex Player",
                    email: "alex@test.com",
                    avatarUrl: null,
                },
            },
        ]);

        const { result } = renderHook(() => useMyEventJoinRequests("user-1"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.requests).toHaveLength(4);
        expect(result.current.activeRequests).toHaveLength(1);
        expect(result.current.activeRequests[0].id).toBe("request-1");
    });
});
