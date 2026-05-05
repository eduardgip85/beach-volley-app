import { CalendarDays, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEventRegistrationsCount } from "../../registrations/services/registrations.service";
import type { Event } from "../types/event.types";

interface Props {
  event: Event;
}

export function EventCard({ event }: Props) {
  const [registrationsCount, setRegistrationsCount] = useState(0);

  const image =
    event.imageUrl ||
    (event.type === "match"
      ? "/beach-ball.png"
      : "/tournament-beach-1.png");

  const isFull = registrationsCount >= event.maxParticipants;

  useEffect(() => {
    async function loadCount() {
      try {
        const count = await getEventRegistrationsCount(event.id);
        setRegistrationsCount(count);
      } catch (error) {
        console.error(error);
      }
    }

    loadCount();
  }, [event.id]);

  return (
    <Link
            to={`/events/${event.id}`}
    >
      
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={image}
          alt={event.title}
          className="h-full w-full object-cover"
        />

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase text-white ${
            event.type === "match" ? "bg-emerald-500" : "bg-blue-600"
          }`}
        >
          {event.type}
        </span>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-900">{event.title}</h2>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={17} className="text-blue-600" />
          {new Date(event.startDate).toLocaleString()}
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={17} className="text-blue-600" />
          {event.locationName}
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-5">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={17} />
            <span>
              {registrationsCount}/{event.maxParticipants}{" "}
              {isFull ? "Full" : "joined"}
            </span>
          </div>

          <div className={`text-sm font-bold ${
              isFull ? "text-slate-400" : "text-blue-600"
            }`}
          >
            {isFull ? "View" : "Join Now"}
          </div>

        </div>
      </div>
    </article>
  
    </Link>
  );
}