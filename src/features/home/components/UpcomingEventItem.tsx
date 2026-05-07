import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Event } from "../../events/types/event.types";

export function UpcomingEventItem({ event }: { event: Event }) {
    const image =
         event.imageUrl ||
        (event.type === "match"
        ? "/beach-ball.png"
        : "/tournament-beach-1.png");

    return (
        <Link
        to={`/events/${event.id}`}
        className="block rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:bg-slate-200 hover:shadow-md "
        >
            <article className="rounded-3xl bg-white shadow-sm md:p-4 p-4 hover:bg-blue-100 transition">
                <div className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-center">
                    <img
                    src={image}
                    alt={event.title}
                    className="h-44 w-full rounded-2xl object-cover md:h-28 md:w-36"
                    />

                    <div>
                        <h3 className="text-xl font-bold text-slate-950">
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
                    className="rounded-2xl bg-slate-50 px-6 py-3 font-bold text-slate-950 hover:bg-blue-600 hover:text-white"
                    >
                        View Details
                    </div>
                    
                </div>
            </article>
        </Link>
    );
}