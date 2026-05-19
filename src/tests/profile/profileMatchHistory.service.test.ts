import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProfileMatchHistory } from "../../features/profile/services/profileMatchHistory.service";

const {
    mockSelect,
    mockEq,
    mockIn,
    mockGetMatchResultsByEventIds,
    mockGetEventsByIds,
} = vi.hoisted(() => ({
    mockSelect: vi.fn(),
    mockEq: vi.fn(),
    mockIn: vi.fn(),
    mockGetMatchResultsByEventIds: vi.fn(),
    mockGetEventsByIds: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        from: vi.fn((table: string) => {
            if (table !== "match_players") {
                throw new Error(`Unexpected table: ${table}`);
            }

            return {
                select: mockSelect,
            };
        }),
    },
}));

vi.mock("../../features/match-results/services/matchResults.service", () => ({
    getMatchResultsByEventIds: mockGetMatchResultsByEventIds,
}));

vi.mock("../../features/events/services/events.service", () => ({
    getEventsByIds: mockGetEventsByIds,
}));

describe("profileMatchHistory.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockSelect.mockReturnValue({
            eq: mockEq,
        });
        mockEq.mockReturnValue({
            in: mockIn,
        });
        mockIn.mockReturnValue({
            in: vi.fn().mockResolvedValue({
                data: [
                    {
                        event_id: "event-1",
                        user_id: "user-1",
                        team: "team_a",
                        status: "joined",
                    },
                ],
                error: null,
            }),
        });
    });

    it("returns accepted matches for the joined player", async () => {
        mockGetMatchResultsByEventIds.mockResolvedValue([
            {
                id: "result-1",
                eventId: "event-1",
                submittedBy: "user-2",
                winningTeam: "team_a",
                validationStatus: "accepted",
                validatedBy: "user-3",
                createdAt: "2026-05-10T20:00:00.000Z",
                updatedAt: "2026-05-10T20:10:00.000Z",
                sets: [
                    {
                        id: "set-1",
                        resultId: "result-1",
                        setNumber: 1,
                        teamAScore: 21,
                        teamBScore: 18,
                    },
                ],
            },
        ]);
        mockGetEventsByIds.mockResolvedValue([
            {
                id: "event-1",
                title: "Beach Match",
                description: null,
                type: "match",
                visibility: "public",
                mode: "competitive",
                locationName: "Barcelona",
                latitude: 41.38,
                longitude: 2.19,
                startDate: "2026-05-10T18:00:00.000Z",
                endDate: null,
                maxParticipants: 4,
                status: "completed",
                resultValidationStatus: "accepted",
                imageUrl: null,
                createdBy: "user-2",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-10T20:10:00.000Z",
            },
        ]);

        const result = await getProfileMatchHistory("user-1", "all");

        expect(mockGetMatchResultsByEventIds).toHaveBeenCalledWith(["event-1"]);
        expect(mockGetEventsByIds).toHaveBeenCalledWith(["event-1"]);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            outcome: "win",
            event: {
                id: "event-1",
                mode: "competitive",
            },
            result: {
                id: "result-1",
                validationStatus: "accepted",
            },
        });
    });

    it("filters matches by mode and applies limits", async () => {
        mockIn.mockReturnValue({
            in: vi.fn().mockResolvedValue({
                data: [
                    {
                        event_id: "event-1",
                        user_id: "user-1",
                        team: "team_a",
                        status: "joined",
                    },
                    {
                        event_id: "event-2",
                        user_id: "user-1",
                        team: "team_b",
                        status: "confirmed",
                    },
                ],
                error: null,
            }),
        });

        mockGetMatchResultsByEventIds.mockResolvedValue([
            {
                id: "result-1",
                eventId: "event-1",
                submittedBy: "user-2",
                winningTeam: "team_a",
                validationStatus: "accepted",
                validatedBy: "user-3",
                createdAt: "2026-05-10T20:00:00.000Z",
                updatedAt: "2026-05-10T20:10:00.000Z",
                sets: [],
            },
            {
                id: "result-2",
                eventId: "event-2",
                submittedBy: "user-4",
                winningTeam: "team_a",
                validationStatus: "accepted",
                validatedBy: "user-5",
                createdAt: "2026-05-12T20:00:00.000Z",
                updatedAt: "2026-05-12T20:10:00.000Z",
                sets: [],
            },
        ]);
        mockGetEventsByIds.mockResolvedValue([
            {
                id: "event-1",
                title: "Competitive Match",
                description: null,
                type: "match",
                visibility: "public",
                mode: "competitive",
                locationName: "Barcelona",
                latitude: 41.38,
                longitude: 2.19,
                startDate: "2026-05-10T18:00:00.000Z",
                endDate: null,
                maxParticipants: 4,
                status: "completed",
                resultValidationStatus: "accepted",
                imageUrl: null,
                createdBy: "user-2",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-10T20:10:00.000Z",
            },
            {
                id: "event-2",
                title: "Casual Match",
                description: null,
                type: "match",
                visibility: "public",
                mode: "casual",
                locationName: "Sitges",
                latitude: 41.23,
                longitude: 1.8,
                startDate: "2026-05-12T18:00:00.000Z",
                endDate: null,
                maxParticipants: 4,
                status: "completed",
                resultValidationStatus: "accepted",
                imageUrl: null,
                createdBy: "user-4",
                createdAt: "2026-05-01T10:00:00.000Z",
                updatedAt: "2026-05-12T20:10:00.000Z",
            },
        ]);

        const result = await getProfileMatchHistory("user-1", "casual", 1);

        expect(result).toHaveLength(1);
        expect(result[0].event.id).toBe("event-2");
        expect(result[0].outcome).toBe("loss");
    });
});
