import { CalendarDays, MapPin, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { isUnlimitedEventCapacity } from "../types/event.types";
import type { Event } from "../types/event.types";
import {
  getEventBadgeClasses,
  getEventFallbackImage,
  getEventModeLabel,
  getEventModeBadgeClasses,
  getEventModeSurfaceClasses,
  getEventTournamentPriceLabel,
  getEventTypeLabel,
  isPastEvent,
} from "../utils/event-display.utils";

interface Props {
  event: Event;
}

export function EventCard({ event }: Props) {
  const { t, i18n } = useTranslation();
  const image = getEventFallbackImage(event);
  const registrationsCount = event.participantCount ?? 0;
  const hasUnlimitedSpots =
    event.type !== "match" && isUnlimitedEventCapacity(event.maxParticipants);
  const isFull = !hasUnlimitedSpots && registrationsCount >= event.maxParticipants;
  const isPast = isPastEvent(event);
  const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;
  const tournamentPriceLabel = getEventTournamentPriceLabel(event);
  const registrationsLabel = hasUnlimitedSpots
    ? t("eventDetail.joined", { count: registrationsCount })
    : t("eventDetail.joinedProgress", {
        joined: registrationsCount,
        total: event.maxParticipants,
      });

  return (
    <Link
            to={`/events/${event.id}`}
    >
      
    <article
      className={`overflow-hidden rounded-3xl shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${getEventModeSurfaceClasses(
        event
      )}`}
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={image}
          alt={event.title}
          className="h-full w-full object-cover"
        />

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
            event
          )}`}
        >
          {getEventTypeLabel(event.type)}
        </span>

        {modeLabel && (
          <span
            className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventModeBadgeClasses(
              event.mode
            )}`}
          >
            {modeLabel}
          </span>
        )}
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-900">{event.title}</h2>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={17} className="text-blue-600" />
          {new Date(event.startDate).toLocaleString(i18n.language, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={17} className="text-blue-600" />
          {event.locationName}
        </div>

        {tournamentPriceLabel ? (
          <div className="mt-3">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
              {tournamentPriceLabel}
            </span>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between border-t pt-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Users size={17} />
            <span>{registrationsLabel}</span>
            {!hasUnlimitedSpots && isFull ? (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                {t("eventDetail.eventFull")}
              </span>
            ) : null}
          </div>

          <div className={`text-sm font-bold ${
              isFull || isPast ? "text-slate-400" : "text-blue-600"
            }`}
          >
            {isPast || isFull ? t("common.viewDetails") : t("eventCard.joinNow")}
          </div>

        </div>
      </div>
    </article>
  
    </Link>
  );
}
