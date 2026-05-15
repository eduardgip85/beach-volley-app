import { CalendarDays, MapPin, X } from "lucide-react";
import { useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { divIcon } from "leaflet";
import type { Event } from "../../events/types/event.types";
import {
  getEventBadgeClasses,
  getEventColorClasses,
  getEventDisplayStatus,
  getEventFallbackImage,
  getEventModeLabel,
  getEventTypeLabel,
  getEventVisibilityBadgeClasses,
  getEventVisibilityLabel,
} from "../../events/utils/event-display.utils";

interface EventsMapProps {
  events: Event[];
}

function getMarkerIcon(event: Event) {
  const color = getEventColorClasses(event);

  return divIcon({
    className: "",
    html: `
      <div class="flex items-center justify-center">
        <div class="${color} h-5 w-6 rounded-full border-2 border-white shadow-md"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function EventsMap({ events }: EventsMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const defaultCenter: [number, number] = [41.3851, 2.1734];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full rounded-3xl"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={getMarkerIcon(event)}
            eventHandlers={{
              click: () => setSelectedEvent(event),
            }}
          />
        ))}
      </MapContainer>

      {selectedEvent && (
        <MapEventPreview
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

function MapEventPreview({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const image = getEventFallbackImage(event);
  const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;
  const displayStatus = getEventDisplayStatus(event);

  return (
    <article className="absolute bottom-28 left-3 right-3 z-[1200] overflow-hidden rounded-3xl bg-white shadow-2xl md:bottom-6 md:left-auto md:right-6 md:w-96">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow md:left-4 md:right-auto md:top-4"
      >
        <X size={16} />
      </button>

      <div className="flex gap-3 p-3 md:hidden">
        <img
          src={image}
          alt={event.title}
          className="h-20 w-24 rounded-2xl object-cover"
        />

        <div className="min-w-0 flex-1 pr-8">
          <div className="mb-2 flex flex-wrap gap-2">
            <div
              className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${getEventBadgeClasses(
                event
              )}`}
            >
              {getEventTypeLabel(event.type)}
            </div>

            <div
              className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${getEventVisibilityBadgeClasses(
                event.visibility
              )}`}
            >
              {getEventVisibilityLabel(event.visibility)}
            </div>
          </div>

          <h2 className="truncate text-base font-black text-slate-950">
            {event.title}
          </h2>

          <p className="mt-1 text-xs font-semibold text-slate-600">
            {[modeLabel, displayStatus].filter(Boolean).join(" · ")}
          </p>

          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPin size={13} />
            {event.locationName}
          </p>

          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-600">
            <CalendarDays size={13} />
            {new Date(event.startDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="absolute bottom-3 right-3 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
        >
          Details
        </Link>
      </div>

      <div className="hidden md:block">
        <div className="relative h-40 overflow-hidden">
          <img
            src={image}
            alt={event.title}
            className="h-full w-full object-cover"
          />

          <span className="absolute right-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold uppercase text-white">
            {displayStatus}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                {event.title}
              </h2>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={16} />
                {event.locationName}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-3 py-2 text-center text-blue-600">
              <p className="text-lg font-black">
                {new Date(event.startDate).getDate()}
              </p>
              <p className="text-[10px] font-bold uppercase">
                {new Date(event.startDate).toLocaleString("en", {
                  month: "short",
                })}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Type
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {getEventTypeLabel(event.type)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Status
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {displayStatus}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Visibility
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {getEventVisibilityLabel(event.visibility)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                {modeLabel ? "Mode" : "Date"}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {modeLabel ??
                  new Date(event.startDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="mt-4 block rounded-2xl bg-blue-600 px-5 py-4 text-center font-bold text-white shadow-sm hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
