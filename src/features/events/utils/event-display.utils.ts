import type {
    Event,
    EventMode,
    EventType,
    EventVisibility,
} from "../types/event.types";

export function isPastEvent(event: Event) {
    return new Date(event.startDate) < new Date();
}

function isCompletedEvent(event: Event) {
    return event.status === "completed";
}

export function isFinishedEvent(event: Event) {
    return isPastEvent(event) || isCompletedEvent(event);
}

export function getEventTypeLabel(type: EventType) {
    switch (type) {
        case "match":
            return "Match";
        case "open_play":
            return "Open Play";
        case "tournament":
            return "Tournament";
        default:
            return "Event";
    }
}

export function getEventModeLabel(mode: EventMode | null) {
    if (mode === "casual") {
        return "Casual";
    }

    if (mode === "competitive") {
        return "Competitive";
    }

    return null;
}

export function getEventModeBadgeClasses(mode: EventMode | null) {
    if (mode === "competitive") {
        return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    }

    if (mode === "casual") {
        return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    }

    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export function getEventModeSurfaceClasses(event: Event) {
    if (event.type === "match") {
        if (event.mode === "competitive") {
            return "bg-[linear-gradient(180deg,_rgba(239,246,255,1)_0%,_rgba(255,255,255,1)_42%)] ring-1 ring-blue-100";
        }

        if (event.mode === "casual") {
            return "bg-[linear-gradient(180deg,_rgba(236,253,245,1)_0%,_rgba(255,255,255,1)_42%)] ring-1 ring-emerald-100";
        }
    }

    if (event.type === "open_play") {
        return "bg-[linear-gradient(180deg,_rgba(255,247,237,1)_0%,_rgba(255,255,255,1)_42%)] ring-1 ring-orange-100";
    }

    if (event.type === "tournament") {
        return "bg-[linear-gradient(180deg,_rgba(254,252,232,1)_0%,_rgba(255,255,255,1)_42%)] ring-1 ring-yellow-100";
    }

    return "bg-white";
}

export function getEventVisibilityLabel(visibility: EventVisibility) {
    return visibility === "private" ? "Private" : "Public";
}

export function getEventDisplayStatus(event: Event) {
    if (isFinishedEvent(event)) {
        return "Finished";
    }

    if (event.status === "cancelled") {
        return "Cancelled";
    }

    return "Active";
}

export function getEventColorClasses(event: Event) {
    if (isFinishedEvent(event)) {
        return "bg-red-500";
    }

    if (event.type === "open_play") {
        return "bg-orange-500";
    }

    if (event.type === "match") {
        return event.mode === "competitive" ? "bg-blue-600" : "bg-emerald-500";
    }

    return "bg-yellow-500";
}

export function getEventBadgeClasses(event: Event) {
    if (isFinishedEvent(event)) {
        return "bg-red-100 text-red-700";
    }

    if (event.type === "open_play") {
        return "bg-orange-100 text-orange-700";
    }

    if (event.type === "match") {
        return event.mode === "competitive"
            ? "bg-blue-100 text-blue-700"
            : "bg-emerald-100 text-emerald-700";
    }

    return "bg-yellow-100 text-yellow-800";
}

export function getEventVisibilityBadgeClasses(visibility: EventVisibility) {
    return visibility === "private"
        ? "bg-slate-900 text-white"
        : "bg-slate-100 text-slate-700";
}

export function getEventFallbackImage(event: Event) {
    if (event.imageUrl) {
        return event.imageUrl;
    }

    if (event.type === "match") {
        return "/beach-ball.png";
    }

    if (event.type === "open_play") {
        return "/beach-volley-net.png";
    }

    return "/tournament-beach-1.png";
}
