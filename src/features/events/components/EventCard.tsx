import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Event } from "../types/event.types";

interface Props {
  event: Event;
}

export function EventCard({ event }: Props) {
  const image =
    event.imageUrl ||
    (event.type === "match"
      ? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200"
      : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200");

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-md">

      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={image}
          alt={event.title}
          className="h-full w-full object-cover"
        />

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase text-white ${
            event.type === "match"
              ? "bg-emerald-500"
              : "bg-blue-600"
          }`}
        >
          {event.type}
        </span>
      </div>

      <div className="p-5">
        <h2 className="text-lg font-bold text-slate-900">
          {event.title}
        </h2>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={16} />
          {new Date(event.startDate).toLocaleString()}
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={16} />
          {event.locationName}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users size={16} />
            <span>0/{event.maxParticipants}</span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="text-sm font-semibold text-blue-600"
          >
            Join Now
          </Link>
        </div>
      </div>
    </article>
  );
}