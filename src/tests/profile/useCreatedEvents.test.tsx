import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreatedEvents } from "../../features/profile/hooks/useCreatedEvents";

const {
    mockGetEventsCreatedByUser,
} = vi.hoisted(() => ({
    mockGetEventsCreatedByUser: vi.fn(),
}));

vi.mock("../../features/events/services/events.service", () => ({
    getEventsCreatedByUser: mockGetEventsCreatedByUser,
}));

describe("useCreatedEvents", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("keeps only active created events that are not already finished", async () => {
        mockGetEventsCreatedByUser.mockResolvedValue([
            {
                id: "event-1",
                title: "Future Competitive Match",
                description: "",
                type: "match",
                visibility: "public",
                mode: "competitive",
                locationName: "Beach",
                latitude: 1,
                longitude: 1,
                startDate: "2099-05-16T12:00:00.000Z",
                endDate: null,
                maxParticipants: 4,
                status: "active",
                imageUrl: null,
                createdBy: "user-1",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-01T10:00:00.000Z",
            },
            {
                id: "event-2",
                title: "Validated Match",
                description: "",
                type: "match",
                visibility: "private",
                mode: "casual",
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
                id: "event-3",
                title: "Past Open Play",
                description: "",
                type: "open_play",
                visibility: "public",
                mode: null,
                locationName: "Beach",
                latitude: 1,
                longitude: 1,
                startDate: "2000-05-14T12:00:00.000Z",
                endDate: null,
                maxParticipants: 10,
                status: "active",
                imageUrl: null,
                createdBy: "user-1",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-01T10:00:00.000Z",
            },
        ]);

        const { result } = renderHook(() => useCreatedEvents("user-1"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.events).toHaveLength(1);
        expect(result.current.events[0].id).toBe("event-1");
    });
});
