import { describe, expect, it, vi } from "vitest";
import type { Event } from "../../features/events/types/event.types";
import {
    getEventBadgeClasses,
    getEventDisplayStatus,
    getEventFallbackImage,
    getEventModeLabel,
    getEventTypeLabel,
    getEventVisibilityBadgeClasses,
    getEventVisibilityLabel,
} from "../../features/events/utils/event-display.utils";

function createEvent(overrides: Partial<Event> = {}): Event {
    return {
        id: "event-1",
        title: "Test Event",
        description: null,
        type: "match",
        visibility: "public",
        mode: "casual",
        locationName: "Barceloneta",
        latitude: 41.3851,
        longitude: 2.1734,
        startDate: "2099-06-01T18:00:00.000Z",
        endDate: null,
        maxParticipants: 4,
        status: "active",
        imageUrl: null,
        createdBy: "user-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        ...overrides,
    };
}

describe("event-display.utils", () => {
    it("returns human labels for type, mode, and visibility", () => {
        expect(getEventTypeLabel("match")).toBe("Match");
        expect(getEventTypeLabel("open_play")).toBe("Open Play");
        expect(getEventTypeLabel("tournament")).toBe("Tournament");
        expect(getEventModeLabel("casual")).toBe("Casual");
        expect(getEventModeLabel("competitive")).toBe("Competitive");
        expect(getEventModeLabel(null)).toBeNull();
        expect(getEventVisibilityLabel("public")).toBe("Public");
        expect(getEventVisibilityLabel("private")).toBe("Private");
    });

    it("returns finished status and red badges for past events", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-10T10:00:00.000Z"));

        const pastEvent = createEvent({
            startDate: "2026-06-01T10:00:00.000Z",
            type: "open_play",
            mode: null,
        });

        expect(getEventDisplayStatus(pastEvent)).toBe("Finished");
        expect(getEventBadgeClasses(pastEvent)).toBe("bg-red-100 text-red-700");

        vi.useRealTimers();
    });

    it("returns finished status for completed events even if their date is in the future", () => {
        const completedEvent = createEvent({
            startDate: "2099-06-01T10:00:00.000Z",
            status: "completed",
        });

        expect(getEventDisplayStatus(completedEvent)).toBe("Finished");
        expect(getEventBadgeClasses(completedEvent)).toBe("bg-red-100 text-red-700");
    });

    it("returns color variants by event type and mode", () => {
        expect(getEventBadgeClasses(createEvent())).toBe(
            "bg-emerald-100 text-emerald-700"
        );
        expect(
            getEventBadgeClasses(createEvent({ mode: "competitive" }))
        ).toBe("bg-blue-100 text-blue-700");
        expect(
            getEventBadgeClasses(
                createEvent({ type: "open_play", mode: null, maxParticipants: 12 })
            )
        ).toBe("bg-amber-100 text-amber-700");
        expect(getEventVisibilityBadgeClasses("private")).toBe(
            "bg-slate-900 text-white"
        );
    });

    it("returns safe fallback images by event type", () => {
        expect(getEventFallbackImage(createEvent())).toBe("/beach-ball.png");
        expect(
            getEventFallbackImage(
                createEvent({ type: "open_play", mode: null, maxParticipants: 12 })
            )
        ).toBe("/beach-volley-net.png");
        expect(
            getEventFallbackImage(
                createEvent({ type: "tournament", mode: null, maxParticipants: 16 })
            )
        ).toBe("/tournament-beach-1.png");
    });
});
