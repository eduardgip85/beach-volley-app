import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    createEvent,
    getEventDetailSummary,
    deleteEvent,
    getEventById,
    getEventsCreatedByUser,
    getEvents,
    getPublicEvents,
    invalidateEventServiceCache,
    updateEvent,
} from "../../features/events/services/events.service";

const { mockJoinMatch, mockRpc } = vi.hoisted(() => ({
    mockJoinMatch: vi.fn(),
    mockRpc: vi.fn(),
}));

vi.mock("../../features/match-players/services/matchPlayers.service", () => ({
    joinMatch: mockJoinMatch,
}));

const mockOrder = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../config/supabase", () => ({
    supabase: {
        rpc: mockRpc,
        from: vi.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        })),
    },
}));

const eventRow = {
    id: "event-1",
    title: "Beach Match",
    description: "Friendly match",
    type: "match",
    visibility: null,
    mode: null,
    location_name: "Barceloneta Beach",
    latitude: "41.3851",
    longitude: "2.1734",
    start_date: "2026-05-01T10:00:00.000Z",
    end_date: null,
    max_participants: 4,
    status: "active",
    image_url: null,
    created_by: "user-1",
    created_at: "2026-04-30T10:00:00.000Z",
    updated_at: "2026-04-30T10:00:00.000Z",
};

const privateEventRow = {
    ...eventRow,
    id: "event-2",
    title: "Private Open Play",
    type: "open_play",
    visibility: "private",
    mode: null,
    location_name: "Nova Icaria",
    max_participants: 12,
};

describe("events.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        invalidateEventServiceCache();

        mockSelect.mockReturnValue({
            order: mockOrder,
            eq: mockEq,
            single: mockSingle,
            maybeSingle: mockMaybeSingle,
            in: mockIn,
        });

        mockInsert.mockReturnValue({
            select: mockSelect,
        });

        mockUpdate.mockReturnValue({
            eq: mockEq,
        });

        mockDelete.mockReturnValue({
            eq: mockEq,
        });

        mockEq.mockReturnValue({
            single: mockSingle,
            maybeSingle: mockMaybeSingle,
            select: mockSelect,
            order: mockOrder,
        });

        mockIn.mockImplementation((column: string) => {
            if (column === "event_id") {
                return {
                    in: mockIn,
                };
            }

            return Promise.resolve({
                data: [],
                error: null,
            });
        });
    });

    describe("getEvents", () => {
        it("should return mapped events ordered by start date", async () => {
            mockOrder.mockResolvedValue({
                data: [eventRow],
                error: null,
            });

            const result = await getEvents();

            expect(result).toEqual([
                {
                id: "event-1",
                title: "Beach Match",
                description: "Friendly match",
                type: "match",
                visibility: "public",
                mode: "casual",
                locationName: "Barceloneta Beach",
                latitude: 41.3851,
                longitude: 2.1734,
                startDate: "2026-05-01T10:00:00.000Z",
                endDate: null,
                maxParticipants: 4,
                status: "cancelled",
                resultValidationStatus: null,
                participantCount: 0,
                imageUrl: null,
                createdBy: "user-1",
                createdAt: "2026-04-30T10:00:00.000Z",
                updatedAt: "2026-04-30T10:00:00.000Z",
                },
            ]);

            expect(mockSelect).toHaveBeenCalledWith("*");
            expect(mockOrder).toHaveBeenCalledWith("start_date", {
                ascending: true,
            });
        });

        it("should throw when Supabase returns an error", async () => {
            mockOrder.mockResolvedValue({
                data: null,
                error: new Error("Database error"),
            });

            await expect(getEvents()).rejects.toThrow("Database error");
        });
    });

    describe("getPublicEvents", () => {
        it("should return only public events", async () => {
            mockOrder.mockResolvedValue({
                data: [eventRow, privateEventRow],
                error: null,
            });

            const result = await getPublicEvents();

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("event-1");
            expect(result[0].visibility).toBe("public");
        });
    });

    describe("getEventById", () => {
        it("should return one mapped event by id", async () => {
            mockSingle.mockResolvedValue({
                data: eventRow,
                error: null,
            });

            const result = await getEventById("event-1");

            expect(result.id).toBe("event-1");
            expect(result.locationName).toBe("Barceloneta Beach");
            expect(result.latitude).toBe(41.3851);
            expect(result.longitude).toBe(2.1734);
            expect(result.status).toBe("cancelled");

            expect(mockEq).toHaveBeenCalledWith("id", "event-1");
        });

        it("should throw when event is not found", async () => {
            mockSingle.mockResolvedValue({
                data: null,
                error: new Error("Event not found"),
            });

            await expect(getEventById("wrong-id")).rejects.toThrow(
                "Event not found"
            );
        });
    });

    describe("getEventsCreatedByUser", () => {
        it("returns public and private events created by the user", async () => {
            mockOrder.mockResolvedValue({
                data: [eventRow, privateEventRow],
                error: null,
            });

            const result = await getEventsCreatedByUser("user-1");

            expect(mockEq).toHaveBeenCalledWith("created_by", "user-1");
            expect(result).toHaveLength(2);
            expect(result[1].visibility).toBe("private");
        });
    });

    describe("getEventDetailSummary", () => {
        it("returns the mapped event summary in one rpc call", async () => {
            mockRpc.mockResolvedValue({
                data: {
                    event: eventRow,
                    creatorName: "Alex Player",
                    registrationsCount: 3,
                    isRegistered: true,
                },
                error: null,
            });

            const result = await getEventDetailSummary("event-1");

            expect(mockRpc).toHaveBeenCalledWith("get_event_detail_summary", {
                target_event_id: "event-1",
            });
            expect(result.event.id).toBe("event-1");
            expect(result.creatorName).toBe("Alex Player");
            expect(result.registrationsCount).toBe(3);
            expect(result.isRegistered).toBe(true);
        });

        it("maps rpc responses with snake_case summary fields and camelCase event fields", async () => {
            mockRpc.mockResolvedValue({
                data: {
                    event: {
                        ...eventRow,
                        location_name: undefined,
                        start_date: undefined,
                        end_date: undefined,
                        max_participants: undefined,
                        image_url: undefined,
                        created_by: undefined,
                        created_at: undefined,
                        updated_at: undefined,
                        locationName: "Bogatell Beach",
                        startDate: "2026-06-10T18:30:00.000Z",
                        endDate: null,
                        maxParticipants: 4,
                        imageUrl: null,
                        createdBy: "user-1",
                        createdAt: "2026-06-01T08:00:00.000Z",
                        updatedAt: "2026-06-01T08:00:00.000Z",
                    },
                    creator_name: "Carla Spike",
                    registrations_count: 4,
                    is_registered: false,
                },
                error: null,
            });

            const result = await getEventDetailSummary("event-1");

            expect(result.event.locationName).toBe("Bogatell Beach");
            expect(result.event.startDate).toBe("2026-06-10T18:30:00.000Z");
            expect(result.creatorName).toBe("Carla Spike");
            expect(result.registrationsCount).toBe(4);
            expect(result.isRegistered).toBe(false);
        });
    });

    describe("createEvent", () => {
        it("should create an event and return the mapped event", async () => {
            mockSingle.mockResolvedValue({
                data: eventRow,
                error: null,
            });

            const payload = {
                title: "Beach Match",
                description: "Friendly match",
                type: "match" as const,
                visibility: "private" as const,
                mode: "competitive" as const,
                locationName: "Barceloneta Beach",
                latitude: 41.3851,
                longitude: 2.1734,
                startDate: "2026-05-01T10:00:00.000Z",
                endDate: null,
                maxParticipants: 8,
                imageUrl: null,
            };

            const result = await createEvent(payload, "user-1");

            expect(result.title).toBe("Beach Match");

            expect(mockInsert).toHaveBeenCalledWith({
                title: "Beach Match",
                description: "Friendly match",
                type: "match",
                visibility: "private",
                mode: "competitive",
                location_name: "Barceloneta Beach",
                latitude: 41.3851,
                longitude: 2.1734,
                image_url: null,
                start_date: "2026-05-01T10:00:00.000Z",
                end_date: null,
                max_participants: 4,
                created_by: "user-1",
                status: "active",
            });
            expect(mockJoinMatch).toHaveBeenCalledWith("event-1", "user-1");
        });

        it("should throw when create fails", async () => {
            mockSingle.mockResolvedValue({
                data: null,
                error: new Error("Create failed"),
            });

            await expect(
                createEvent(
                {
                    title: "Beach Match",
                    description: "Friendly match",
                    type: "match",
                    visibility: "public",
                    mode: null,
                    locationName: "Barceloneta Beach",
                    latitude: 41.3851,
                    longitude: 2.1734,
                    startDate: "2026-05-01T10:00:00.000Z",
                    endDate: null,
                    maxParticipants: 8,
                    imageUrl: null,
                },
                "user-1"
                )
            ).rejects.toThrow("Create failed");
        });
    });

    describe("updateEvent", () => {
        it("should update an event and return the mapped event", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: {
                ...eventRow,
                title: "Updated Beach Match",
                },
                error: null,
            });

            const result = await updateEvent("event-1", {
                title: "Updated Beach Match",
                description: "Updated description",
                type: "match",
                visibility: "public",
                mode: null,
                locationName: "Barceloneta Beach",
                latitude: 41.3851,
                longitude: 2.1734,
                startDate: "2026-05-01T10:00:00.000Z",
                endDate: null,
                maxParticipants: 10,
                imageUrl: null,
            });

            expect(result.title).toBe("Updated Beach Match");

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                title: "Updated Beach Match",
                description: "Updated description",
                type: "match",
                visibility: "public",
                mode: "casual",
                location_name: "Barceloneta Beach",
                latitude: 41.3851,
                longitude: 2.1734,
                max_participants: 4,
                image_url: null,
                })
            );
        });

        it("should throw when update fails", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: null,
                error: new Error("Update failed"),
            });

            await expect(
                updateEvent("event-1", {
                title: "Updated Beach Match",
                description: "Updated description",
                type: "match",
                visibility: "public",
                mode: null,
                locationName: "Barceloneta Beach",
                latitude: 41.3851,
                longitude: 2.1734,
                startDate: "2026-05-01T10:00:00.000Z",
                endDate: null,
                maxParticipants: 10,
                imageUrl: null,
                })
            ).rejects.toThrow("Update failed");
        });

        it("should refetch the event when Supabase returns no updated row", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: null,
                error: null,
            });
            mockSingle.mockResolvedValue({
                data: {
                    ...eventRow,
                    title: "Refetched Beach Match",
                },
                error: null,
            });

            const result = await updateEvent("event-1", {
                title: "Refetched Beach Match",
                description: "Updated description",
                type: "match",
                visibility: "public",
                mode: null,
                locationName: "Barceloneta Beach",
                latitude: 41.3851,
                longitude: 2.1734,
                startDate: "2026-05-01T10:00:00.000Z",
                endDate: null,
                maxParticipants: 10,
                imageUrl: null,
            });

            expect(result.title).toBe("Refetched Beach Match");
        });
    });

    describe("deleteEvent", () => {
        it("should delete an event by id", async () => {
        mockEq.mockResolvedValue({
            error: null,
        });

        await deleteEvent("event-1");

        expect(mockDelete).toHaveBeenCalled();
        expect(mockEq).toHaveBeenCalledWith("id", "event-1");
        });

        it("should throw when delete fails", async () => {
        mockEq.mockResolvedValue({
            error: new Error("Delete failed"),
        });

        await expect(deleteEvent("event-1")).rejects.toThrow("Delete failed");
        });
    });
});
