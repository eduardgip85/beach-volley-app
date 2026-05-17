import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Event } from "../../events/types/event.types";
import {
    getEventBadgeClasses,
    getEventFallbackImage,
    getEventModeLabel,
    getEventModeBadgeClasses,
    getEventModeSurfaceClasses,
    getEventTypeLabel,
} from "../../events/utils/event-display.utils";

export function UpcomingEventItem({ event }: { event: Event }) {
    const image = getEventFallbackImage(event);
    const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;

    return (
        <Link
        to={`/events/${event.id}`}
        className="block rounded-3xl shadow-sm transition hover:-translate-y-1 hover:shadow-md "
        >
            <article
                className={`rounded-3xl p-3 shadow-sm transition md:p-4 ${getEventModeSurfaceClasses(
                    event
                )}`}
            >
                <div className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-center">
                    <img
                    src={image}
                    alt={event.title}
                    className="h-36 w-full rounded-2xl object-cover md:h-28 md:w-36"
                    />

                    <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                            <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                                event
                            )}`}
                            >
                                {getEventTypeLabel(event.type)}
                            </span>

                            {modeLabel && (
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${getEventModeBadgeClasses(
                                        event.mode
                                    )}`}
                                >
                                    {modeLabel}
                                </span>
                            )}
                        </div>

                        <h3 className="mt-1 text-lg font-bold text-slate-950 md:text-xl">
                            {event.title}
                        </h3>

                        <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:gap-8">
                            <span className="inline-flex items-center gap-2">
                            <CalendarDays size={16} />
                            {new Date(event.startDate).toLocaleString()}
                            </span>

                            <span className="inline-flex items-center gap-2">
                            <MapPin size={16} />
                            {event.locationName}
                            </span>
                        </div>
                    </div>

                    <div 
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-950 hover:bg-blue-600 hover:text-white md:px-6"
                    >
                        View Details
                    </div>
                    
                </div>
            </article>
        </Link>
    );
}
