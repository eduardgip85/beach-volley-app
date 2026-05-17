import { CalendarDays, MapPin, Trophy, Users, Volleyball } from "lucide-react";
import { Link } from "react-router-dom";
import type { Event } from "../../events/types/event.types";
import {
    getEventBadgeClasses,
    isFinishedEvent,
} from "../utils/calendar.utils";
import {
    getEventModeLabel,
    getEventModeBadgeClasses,
    getEventModeSurfaceClasses,
    getEventTypeLabel,
} from "../../events/utils/event-display.utils";

interface CalendarEventCardProps {
    event: Event;
    compact?: boolean;
}

export function CalendarEventCard({
    event,
    compact = false,
}: CalendarEventCardProps) {
    const isFinished = isFinishedEvent(event);
    const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;
    const cardClasses = `block rounded-3xl shadow-sm transition ${
        isFinished
            ? "cursor-not-allowed ring-1 ring-red-200"
            : "hover:-translate-y-1 hover:shadow-md hover:bg-blue-100"
    } ${compact ? "p-4" : "p-5"} ${isFinished ? "bg-white" : getEventModeSurfaceClasses(event)}`;
    const content = (
        <div className="flex gap-4">
            <div
            className={`flex items-center justify-center rounded-2xl ${getEventBadgeClasses(
                event
            )} ${compact ? "h-14 w-14" : "h-16 w-16"}`}
            >
            <EventTypeIcon type={event.type} />
            </div>

            <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <h3 className="truncate font-black text-slate-950">
                {event.title}
                </h3>

                <span className="text-sm font-bold text-slate-400">
                {new Date(event.startDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                </span>
            </div>

            <div className="mt-2 flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:flex-wrap md:gap-4">
                <span className="inline-flex items-center gap-2">
                <MapPin size={15} />
                {event.locationName}
                </span>

                <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                    event
                )}`}
                >
                <Trophy size={15} />
                {isFinished ? "Finished" : getEventTypeLabel(event.type)}
                </span>

                {modeLabel && (
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getEventModeBadgeClasses(
                        event.mode
                    )}`}
                >
                    {modeLabel}
                </span>
                )}

                {isFinished && (
                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    Not available in details
                </span>
                )}

                <span className="inline-flex items-center gap-2 capitalize">
                <CalendarDays size={15} />
                {new Date(event.startDate).toLocaleDateString([], {
                    day: "numeric",
                    month: "short",
                })}
                </span>
            </div>
            </div>
        </div>
    );

    if (isFinished) {
        return <div className={cardClasses}>{content}</div>;
    }

    return (
        <Link to={`/events/${event.id}`} className={cardClasses}>
            {content}
        </Link>
    );
}

function EventTypeIcon({ type }: { type: Event["type"] }) {
    if (type === "match") {
        return <Volleyball size={24} />;
    }

    if (type === "open_play") {
        return <Users size={24} />;
    }

    return <Trophy size={24} />;
}
