import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEventForm } from "../../features/events/hooks/useEventForm";
import type { Event } from "../../features/events/types/event.types";

function createSubmitEvent() {
    return {
        preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
}

function createInitialEvent(overrides: Partial<Event> = {}): Event {
    return {
        id: "event-1",
        title: "Sunrise Session",
        description: "Morning beach volleyball",
        type: "match",
        visibility: "private",
        mode: "competitive",
        locationName: "Barceloneta Court 2",
        latitude: 41.3851,
        longitude: 2.1734,
        startDate: "2026-05-18T08:00:00.000Z",
        endDate: null,
        maxParticipants: 12,
        status: "active",
        imageUrl: null,
        createdBy: "user-1",
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
        ...overrides,
    };
}

describe("useEventForm", () => {
    it("loads existing match values and keeps max participants locked to four", () => {
        const onSubmit = vi.fn();

        const { result } = renderHook(() =>
            useEventForm({
                initialEvent: createInitialEvent(),
                onSubmit,
            })
        );

        expect(result.current.values.title).toBe("Sunrise Session");
        expect(result.current.values.type).toBe("match");
        expect(result.current.values.visibility).toBe("private");
        expect(result.current.values.mode).toBe("competitive");
        expect(result.current.values.maxParticipants).toBe(4);
    });

    it("updates dependent fields when switching between match and open play", () => {
        const onSubmit = vi.fn();

        const { result } = renderHook(() =>
            useEventForm({
                onSubmit,
            })
        );

        act(() => {
            result.current.setters.setType("open_play");
            result.current.setters.setMaxParticipants(12);
        });

        expect(result.current.values.type).toBe("open_play");
        expect(result.current.values.mode).toBeNull();
        expect(result.current.values.maxParticipants).toBe(12);

        act(() => {
            result.current.setters.setType("match");
        });

        expect(result.current.values.type).toBe("match");
        expect(result.current.values.mode).toBe("casual");
        expect(result.current.values.maxParticipants).toBe(4);
    });

    it("submits match payload with fixed max participants and required mode", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useEventForm({
                onSubmit,
            })
        );

        act(() => {
            result.current.setters.setTitle("Competitive Match");
            result.current.setters.setDate("2026-06-01");
            result.current.setters.setTime("18:30");
            result.current.setters.setLocationName("Nova Icaria");
            result.current.setters.setVisibility("private");
            result.current.setters.setMode("competitive");
            result.current.setters.setMaxParticipants(10);
        });

        await act(async () => {
            await result.current.actions.handleSubmit(createSubmitEvent());
        });

        expect(onSubmit).toHaveBeenCalledWith({
            title: "Competitive Match",
            description: "",
            type: "match",
            visibility: "private",
            mode: "competitive",
            locationName: "Nova Icaria",
            latitude: 41.3851,
            longitude: 2.1734,
            startDate: new Date("2026-06-01T18:30").toISOString(),
            maxParticipants: 4,
            imageUrl: null,
        });
    });

    it("submits open play payload with null mode and configurable max participants", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useEventForm({
                onSubmit,
            })
        );

        act(() => {
            result.current.setters.setType("open_play");
            result.current.setters.setTitle("Afterwork Open Play");
            result.current.setters.setDate("2026-06-02");
            result.current.setters.setTime("19:00");
            result.current.setters.setLocationName("Bogatell");
            result.current.setters.setMaxParticipants(14);
        });

        await act(async () => {
            await result.current.actions.handleSubmit(createSubmitEvent());
        });

        expect(onSubmit).toHaveBeenCalledWith({
            title: "Afterwork Open Play",
            description: "",
            type: "open_play",
            visibility: "public",
            mode: null,
            locationName: "Bogatell",
            latitude: 41.3851,
            longitude: 2.1734,
            startDate: new Date("2026-06-02T19:00").toISOString(),
            maxParticipants: 14,
            imageUrl: null,
        });
    });

    it("blocks tournament submission", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useEventForm({
                initialEvent: createInitialEvent({ type: "tournament", mode: null }),
                onSubmit,
            })
        );

        act(() => {
            result.current.setters.setTitle("Summer Tournament");
            result.current.setters.setDate("2026-06-10");
            result.current.setters.setTime("10:00");
            result.current.setters.setLocationName("Mar Bella");
        });

        await act(async () => {
            await result.current.actions.handleSubmit(createSubmitEvent());
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(result.current.state.error).toBe("Tournament events are coming soon");
    });
});
