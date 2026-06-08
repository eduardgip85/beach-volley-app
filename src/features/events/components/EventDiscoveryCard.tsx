import { CalendarDays, ChevronRight, MapPin, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { isUnlimitedEventCapacity } from "../types/event.types";
import type { Event } from "../types/event.types";
import {
  getEventBadgeClasses,
  getEventColorClasses,
  getEventFallbackImage,
  getEventModeBadgeClasses,
  getEventModeLabel,
  getEventModeSurfaceClasses,
  getEventTournamentPriceLabel,
  getEventTypeLabel,
  isPastEvent,
} from "../utils/event-display.utils";

interface Props {
  event: Event;
}

export function EventDiscoveryCard({ event }: Props) {
  const { t, i18n } = useTranslation();
  const registrationsCount = event.participantCount ?? 0;
  const hasUnlimitedSpots =
    event.type !== "match" && isUnlimitedEventCapacity(event.maxParticipants);
  const isFull = !hasUnlimitedSpots && registrationsCount >= event.maxParticipants;
  const isPast = isPastEvent(event);
  const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;
  const priceLabel = getEventTournamentPriceLabel(event);
  const progress = hasUnlimitedSpots
    ? 0
    : Math.min(100, Math.round((registrationsCount / event.maxParticipants) * 100));
  const availableSpots = Math.max(event.maxParticipants - registrationsCount, 0);

  return (
    <Link to={`/events/${event.id}`} className="block h-full">
      <article
        className={`group relative h-full overflow-hidden rounded-[1.75rem] shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl ${getEventModeSurfaceClasses(
          event
        )} grid grid-cols-[7rem_minmax(0,1fr)] sm:block`}
      >
        <div className="relative h-full min-h-44 overflow-hidden sm:h-40">
          <img
            src={getEventFallbackImage(event)}
            alt={event.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] sm:left-4 sm:top-4 sm:text-xs ${getEventBadgeClasses(
              event
            )}`}
          >
            {getEventTypeLabel(event.type)}
          </span>
          {priceLabel ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-amber-100/95 px-2.5 py-1 text-[9px] font-black uppercase text-amber-800 sm:bottom-4 sm:left-4 sm:text-xs">
              {priceLabel}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 p-3.5 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5">
                {modeLabel ? (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${getEventModeBadgeClasses(
                      event.mode
                    )}`}
                  >
                    {modeLabel}
                  </span>
                ) : null}
                {!hasUnlimitedSpots && isFull ? (
                  <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white">
                    {t("eventDetail.eventFull")}
                  </span>
                ) : null}
              </div>
              <h2 className="mt-2 line-clamp-2 text-base font-black text-slate-950 sm:text-xl">
                {event.title}
              </h2>
            </div>
            <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${getEventColorClasses(event)}`} />
          </div>

          <div className="mt-3 space-y-2 text-xs text-slate-500 sm:text-sm">
            <p className="flex items-center gap-2">
              <CalendarDays size={15} className="shrink-0 text-blue-600" />
              {new Date(event.startDate).toLocaleString(i18n.language, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0 text-blue-600" />
              <span className="truncate">{event.locationName}</span>
            </p>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Users size={14} />
                {hasUnlimitedSpots
                  ? t("eventDetail.joined", { count: registrationsCount })
                  : t("eventDetail.joinedProgress", {
                      joined: registrationsCount,
                      total: event.maxParticipants,
                    })}
              </span>
              {!hasUnlimitedSpots && !isFull ? (
                <span className="text-emerald-700">
                  {t("eventCard.spotsLeft", { count: availableSpots })}
                </span>
              ) : null}
            </div>
            {!hasUnlimitedSpots ? (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${isFull ? "bg-slate-500" : getEventColorClasses(event)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3">
            <span className={`text-xs font-black sm:text-sm ${isPast || isFull ? "text-slate-400" : "text-blue-600"}`}>
              {isPast || isFull ? t("common.viewDetails") : t("eventCard.joinNow")}
            </span>
            <ChevronRight size={17} className="text-slate-400 transition group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}
