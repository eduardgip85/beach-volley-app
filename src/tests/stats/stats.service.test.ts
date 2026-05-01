import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStatsData } from "../../features/stats/services/stats.service";
import { getEvents } from "../../features/events/services/events.service";
import { getEventRegistrationsCount } from "../../features/registrations/services/registrations.service";

const mockSelect = vi.fn();

vi.mock("../../features/events/services/events.service", () => ({
    getEvents: vi.fn(),
}));

vi.mock("../../features/registrations/services/registrations.service", () => ({
    getEventRegistrationsCount: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        from: vi.fn(() => ({
        select: mockSelect,
        })),
    },
}));

const events = [
    {
        id: "event-1",
        title: "Morning Match",
        description: "Match description",
        type: "match",
        locationName: "Barceloneta",
        latitude: 41.3851,
        longitude: 2.1734,
        startDate: "2026-05-01T10:00:00.000Z",
        endDate: null,
        maxParticipants: 8,
        status: "active",
        imageUrl: null,
        createdBy: "user-1",
        createdAt: "2026-04-01T10:00:00.000Z",
        updatedAt: "2026-04-01T10:00:00.000Z",
    },
    {
        id: "event-2",
        title: "Summer Tournament",
        description: "Tournament description",
        type: "tournament",
        locationName: "Bogatell",
        latitude: 41.39,
        longitude: 2.19,
        startDate: "2026-05-15T10:00:00.000Z",
        endDate: null,
        maxParticipants: 16,
        status: "active",
        imageUrl: null,
        createdBy: "user-2",
        createdAt: "2026-04-02T10:00:00.000Z",
        updatedAt: "2026-04-02T10:00:00.000Z",
    },
    {
        id: "event-3",
        title: "Old Match",
        description: "Old match description",
        type: "match",
        locationName: "Barceloneta",
        latitude: 41.3851,
        longitude: 2.1734,
        startDate: "2026-06-01T10:00:00.000Z",
        endDate: null,
        maxParticipants: 8,
        status: "completed",
        imageUrl: null,
        createdBy: "user-3",
        createdAt: "2026-04-03T10:00:00.000Z",
        updatedAt: "2026-04-03T10:00:00.000Z",
    },
] as any[];

describe("stats.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should calculate global event statistics", async () => {
        vi.mocked(getEvents).mockResolvedValue(events);

        vi.mocked(getEventRegistrationsCount).mockImplementation(
        async (eventId: string) => {
            if (eventId === "event-1") return 2;
            if (eventId === "event-2") return 4;
            if (eventId === "event-3") return 1;
            return 0;
        }
        );

        mockSelect.mockResolvedValue({
        count: 5,
        error: null,
        });

        const result = await getStatsData();

        expect(result.totalUsers).toBe(5);
        expect(result.totalEvents).toBe(3);
        expect(result.activeEvents).toBe(2);
        expect(result.totalMatches).toBe(2);
        expect(result.totalTournaments).toBe(1);
        expect(result.totalRegistrations).toBe(7);

        expect(result.eventsByType).toEqual([
        { name: "Matches", value: 2 },
        { name: "Tournaments", value: 1 },
        ]);

        expect(result.eventsByMonth).toEqual([
        { month: "May 2026", count: 2 },
        { month: "Jun 2026", count: 1 },
        ]);

        expect(result.topLocations).toEqual([
        { location: "Barceloneta", count: 2 },
        { location: "Bogatell", count: 1 },
        ]);

        expect(getEventRegistrationsCount).toHaveBeenCalledTimes(3);
        expect(mockSelect).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
        });
    });

    it("should return empty statistics when there are no events", async () => {
        vi.mocked(getEvents).mockResolvedValue([]);

        mockSelect.mockResolvedValue({
        count: 0,
        error: null,
        });

        const result = await getStatsData();

        expect(result.totalUsers).toBe(0);
        expect(result.totalEvents).toBe(0);
        expect(result.activeEvents).toBe(0);
        expect(result.totalMatches).toBe(0);
        expect(result.totalTournaments).toBe(0);
        expect(result.totalRegistrations).toBe(0);
        expect(result.eventsByType).toEqual([
        { name: "Matches", value: 0 },
        { name: "Tournaments", value: 0 },
        ]);
        expect(result.eventsByMonth).toEqual([]);
        expect(result.topLocations).toEqual([]);
    });

    it("should throw when getEvents fails", async () => {
        vi.mocked(getEvents).mockRejectedValue(new Error("Events failed"));

        await expect(getStatsData()).rejects.toThrow("Events failed");
    });
});