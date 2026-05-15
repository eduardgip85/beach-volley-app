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

function hasEventFinished(event: Event) {
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

export function getEventVisibilityLabel(visibility: EventVisibility) {
    return visibility === "private" ? "Private" : "Public";
}

export function getEventDisplayStatus(event: Event) {
    if (hasEventFinished(event)) {
        return "Finished";
    }

    if (event.status === "cancelled") {
        return "Cancelled";
    }

    return "Active";
}

export function getEventColorClasses(event: Event) {
    if (hasEventFinished(event)) {
        return "bg-red-500";
    }

    if (event.type === "open_play") {
        return "bg-amber-500";
    }

    if (event.type === "match") {
        return event.mode === "competitive" ? "bg-blue-600" : "bg-emerald-500";
    }

    return "bg-indigo-600";
}

export function getEventBadgeClasses(event: Event) {
    if (hasEventFinished(event)) {
        return "bg-red-100 text-red-700";
    }

    if (event.type === "open_play") {
        return "bg-amber-100 text-amber-700";
    }

    if (event.type === "match") {
        return event.mode === "competitive"
            ? "bg-blue-100 text-blue-700"
            : "bg-emerald-100 text-emerald-700";
    }

    return "bg-indigo-100 text-indigo-700";
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
