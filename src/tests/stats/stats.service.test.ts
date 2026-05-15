import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStatsData } from "../../features/stats/services/stats.service";
import { getEvents } from "../../features/events/services/events.service";

const mockSelect = vi.fn();

vi.mock("../../features/events/services/events.service", () => ({
    getEvents: vi.fn(),
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
        visibility: "public",
        mode: "casual",
        locationName: "Barceloneta",
        latitude: 41.3851,
        longitude: 2.1734,
        startDate: "2026-05-01T10:00:00.000Z",
        endDate: null,
        maxParticipants: 4,
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
        visibility: "public",
        mode: null,
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
        visibility: "private",
        mode: "competitive",
        locationName: "Barceloneta",
        latitude: 41.3851,
        longitude: 2.1734,
        startDate: "2026-06-01T10:00:00.000Z",
        endDate: null,
        maxParticipants: 4,
        status: "completed",
        imageUrl: null,
        createdBy: "user-3",
        createdAt: "2026-04-03T10:00:00.000Z",
        updatedAt: "2026-04-03T10:00:00.000Z",
    },
] as any[];

const registrations = [
    { event_id: "event-1" },
    { event_id: "event-1" },
    { event_id: "event-2" },
    { event_id: "event-2" },
    { event_id: "event-2" },
    { event_id: "event-2" },
    { event_id: "event-3" },
];

describe("stats.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should calculate global event statistics with optimized database calls", async () => {
        vi.mocked(getEvents).mockResolvedValue(events);

        mockSelect
        .mockResolvedValueOnce({
            data: registrations,
            error: null,
        })
        .mockResolvedValueOnce({
            count: 5,
            error: null,
        });

        const result = await getStatsData();

        expect(result.totalUsers).toBe(5);
        expect(result.totalEvents).toBe(3);
        expect(result.activeEvents).toBe(2);
        expect(result.totalMatches).toBe(2);
        expect(result.totalOpenPlays).toBe(0);
        expect(result.totalTournaments).toBe(1);
        expect(result.totalRegistrations).toBe(7);

        expect(result.eventsByType).toEqual([
        { name: "Matches", value: 2 },
        { name: "Open Play", value: 0 },
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

        expect(getEvents).toHaveBeenCalledTimes(1);
        expect(mockSelect).toHaveBeenCalledTimes(2);

        expect(mockSelect).toHaveBeenCalledWith("event_id");
        expect(mockSelect).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
        });
    });

    it("should return empty statistics when there are no events or registrations", async () => {
        vi.mocked(getEvents).mockResolvedValue([]);

        mockSelect
        .mockResolvedValueOnce({
            data: [],
            error: null,
        })
        .mockResolvedValueOnce({
            count: 0,
            error: null,
        });

        const result = await getStatsData();

        expect(result.totalUsers).toBe(0);
        expect(result.totalEvents).toBe(0);
        expect(result.activeEvents).toBe(0);
        expect(result.totalMatches).toBe(0);
        expect(result.totalOpenPlays).toBe(0);
        expect(result.totalTournaments).toBe(0);
        expect(result.totalRegistrations).toBe(0);

        expect(result.eventsByType).toEqual([
        { name: "Matches", value: 0 },
        { name: "Open Play", value: 0 },
        { name: "Tournaments", value: 0 },
        ]);

        expect(result.eventsByMonth).toEqual([]);
        expect(result.topLocations).toEqual([]);
    });

    it("should throw when getEvents fails", async () => {
        vi.mocked(getEvents).mockRejectedValue(new Error("Events failed"));

        await expect(getStatsData()).rejects.toThrow("Events failed");
    });

    it("should throw when registrations query fails", async () => {
        vi.mocked(getEvents).mockResolvedValue(events);

        mockSelect.mockResolvedValueOnce({
        data: null,
        error: new Error("Registrations failed"),
        });

        await expect(getStatsData()).rejects.toThrow("Registrations failed");
    });

    it("should throw when users count query fails", async () => {
        vi.mocked(getEvents).mockResolvedValue(events);

        mockSelect
        .mockResolvedValueOnce({
            data: registrations,
            error: null,
        })
        .mockResolvedValueOnce({
            count: null,
            error: new Error("Users failed"),
        });

        await expect(getStatsData()).rejects.toThrow("Users failed");
    });
});
