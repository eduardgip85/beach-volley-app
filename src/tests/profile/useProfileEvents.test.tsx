import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProfileEvents } from "../../features/profile/hooks/useProfileEvents";

const {
    mockGetUserRegisteredEventIds,
    mockGetEventsByIds,
} = vi.hoisted(() => ({
    mockGetUserRegisteredEventIds: vi.fn(),
    mockGetEventsByIds: vi.fn(),
}));

vi.mock("../../features/registrations/services/registrations.service", () => ({
    getUserRegisteredEventIds: mockGetUserRegisteredEventIds,
}));

vi.mock("../../features/events/services/events.service", () => ({
    getEventsByIds: mockGetEventsByIds,
}));

describe("useProfileEvents", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("keeps completed matches out of upcoming events and limits the list to the nearest three", async () => {
        mockGetUserRegisteredEventIds.mockResolvedValue([
            "event-1",
            "event-2",
            "event-3",
            "event-4",
            "event-5",
        ]);

        mockGetEventsByIds.mockResolvedValue([
            {
                id: "event-1",
                title: "Accepted Match",
                description: "",
                type: "match",
                visibility: "private",
                mode: "competitive",
                locationName: "Beach",
                latitude: 1,
                longitude: 1,
                startDate: "2099-05-16T18:00:00.000Z",
                endDate: null,
                maxParticipants: 4,
                status: "completed",
                imageUrl: null,
                createdBy: "user-1",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-01T10:00:00.000Z",
            },
            {
                id: "event-2",
                title: "Future Open Play",
                description: "",
                type: "open_play",
                visibility: "public",
                mode: null,
                locationName: "Beach",
                latitude: 1,
                longitude: 1,
                startDate: "2099-05-16T19:00:00.000Z",
                endDate: null,
                maxParticipants: 8,
                status: "active",
                imageUrl: null,
                createdBy: "user-2",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-01T10:00:00.000Z",
            },
            {
                id: "event-3",
                title: "Completed Match",
                description: "",
                type: "match",
                visibility: "public",
                mode: "casual",
                locationName: "Beach",
                latitude: 1,
                longitude: 1,
                startDate: "2099-05-16T20:00:00.000Z",
                endDate: null,
                maxParticipants: 4,
                status: "completed",
                imageUrl: null,
                createdBy: "user-3",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-01T10:00:00.000Z",
            },
            {
                id: "event-4",
                title: "Soon Match",
                description: "",
                type: "match",
                visibility: "public",
                mode: "casual",
                locationName: "Beach",
                latitude: 1,
                longitude: 1,
                startDate: "2099-05-16T17:00:00.000Z",
                endDate: null,
                maxParticipants: 4,
                status: "active",
                imageUrl: null,
                createdBy: "user-4",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-01T10:00:00.000Z",
            },
            {
                id: "event-5",
                title: "Latest Future Match",
                description: "",
                type: "match",
                visibility: "public",
                mode: "competitive",
                locationName: "Beach",
                latitude: 1,
                longitude: 1,
                startDate: "2099-05-16T21:00:00.000Z",
                endDate: null,
                maxParticipants: 4,
                status: "active",
                imageUrl: null,
                createdBy: "user-5",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-01T10:00:00.000Z",
            },
        ]);

        const { result } = renderHook(() => useProfileEvents("user-1"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.upcomingEvents.map((event) => event.id)).toEqual([
            "event-4",
            "event-2",
            "event-5",
        ]);
        expect(result.current.pastEvents.map((event) => event.id)).toEqual([
            "event-1",
            "event-3",
        ]);
    });
});
