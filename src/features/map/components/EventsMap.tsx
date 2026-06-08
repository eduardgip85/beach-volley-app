import {
  CalendarDays,
  ChevronRight,
  LocateFixed,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import { divIcon, type LatLngBounds, type Map as LeafletMap } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Link } from "react-router-dom";
import type { Event } from "../../events/types/event.types";
import { isUnlimitedEventCapacity } from "../../events/types/event.types";
import {
  getEventColorClasses,
  getEventFallbackImage,
  getEventModeLabel,
  getEventTournamentPriceLabel,
  getEventTypeLabel,
} from "../../events/utils/event-display.utils";

interface EventsMapProps {
  events: Event[];
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

function getMarkerIcon(event: Event, isSelected: boolean) {
  const color = getEventColorClasses(event);

  return divIcon({
    className: "",
    html: `
      <div class="relative flex h-10 w-10 items-center justify-center transition-transform ${isSelected ? "scale-125" : ""}">
        <div class="${color} h-7 w-7 rotate-45 rounded-[0.65rem_0.65rem_0.65rem_0] border-[3px] border-white shadow-lg"></div>
        <div class="absolute h-2.5 w-2.5 rounded-full bg-white"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 34],
  });
}

function MapViewportController({
  defaultCenter,
  defaultZoom,
}: {
  defaultCenter: [number, number];
  defaultZoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(defaultCenter, defaultZoom);
  }, [defaultCenter, defaultZoom, map]);

  return null;
}

function MapMovementListener({
  onMove,
  onMapClick,
}: {
  onMove: (bounds: LatLngBounds) => void;
  onMapClick: () => void;
}) {
  useMapEvents({
    moveend: (event) => onMove(event.target.getBounds()),
    click: onMapClick,
  });
  return null;
}

export function EventsMap({
  events,
  defaultCenter = [41.3851, 2.1734],
  defaultZoom = 6,
}: EventsMapProps) {
  const { t } = useTranslation();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [pendingBounds, setPendingBounds] = useState<LatLngBounds | null>(null);
  const [appliedBounds, setAppliedBounds] = useState<LatLngBounds | null>(null);
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [locating, setLocating] = useState(false);

  const visibleEvents = useMemo(
    () =>
      (appliedBounds
        ? events.filter((event) => appliedBounds.contains([event.latitude, event.longitude]))
        : events
      ).sort((left, right) => left.startDate.localeCompare(right.startDate)),
    [appliedBounds, events]
  );
  const selectedEvent =
    visibleEvents.find((event) => event.id === selectedEventId) ?? null;

  function selectEvent(event: Event) {
    setSelectedEventId(event.id);
    map?.flyTo([event.latitude, event.longitude], Math.max(map.getZoom(), 13), {
      duration: 0.7,
    });
  }

  function handleMapMove(bounds: LatLngBounds) {
    setPendingBounds(bounds);
    setShowSearchArea(true);
  }

  function searchVisibleArea() {
    setAppliedBounds(pendingBounds);
    setSelectedEventId(null);
    setShowSearchArea(false);
  }

  function showAllEvents() {
    setAppliedBounds(null);
    setShowSearchArea(false);
    map?.setView(defaultCenter, defaultZoom);
  }

  function locateUser() {
    if (!navigator.geolocation || !map) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.flyTo([coords.latitude, coords.longitude], 13);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-slate-200">
      <MapContainer
        ref={setMap}
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapViewportController defaultCenter={defaultCenter} defaultZoom={defaultZoom} />
        <MapMovementListener
          onMove={handleMapMove}
          onMapClick={() => setSelectedEventId(null)}
        />

        {visibleEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={getMarkerIcon(event, selectedEventId === event.id)}
            zIndexOffset={selectedEventId === event.id ? 1000 : 0}
            eventHandlers={{ click: () => selectEvent(event) }}
          />
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-3 top-3 z-[1300] flex items-start justify-end gap-3 md:left-auto md:right-4 md:top-4">
        <div className="pointer-events-auto hidden rounded-2xl bg-slate-950/90 px-4 py-3 text-white shadow-xl backdrop-blur-md md:block">
          <p className="text-lg font-black">
            {t("mapPage.eventsInArea", { count: visibleEvents.length })}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">
            {appliedBounds ? t("mapPage.filteredArea") : t("mapPage.allVisibleEvents")}
          </p>
        </div>

        <div className="pointer-events-auto flex gap-2">
          {showSearchArea ? (
            <button
              type="button"
              onClick={searchVisibleArea}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-4 text-xs font-black text-white shadow-xl transition hover:bg-blue-700"
            >
              <Search size={15} />
              <span className="hidden sm:inline">{t("mapPage.searchArea")}</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={locateUser}
            aria-label={t("mapPage.myLocation")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-xl transition hover:text-blue-600"
          >
            <LocateFixed size={18} className={locating ? "animate-pulse text-blue-600" : ""} />
          </button>
        </div>
      </div>

      <MapLegend />

      <div className="absolute bottom-4 left-4 top-4 z-[1400] hidden w-[22rem] md:block">
        <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                {t("mapPage.discoveryEyebrow")}
              </p>
              <h2 className="mt-0.5 truncate text-lg font-black text-slate-950 md:text-xl">
                {t("mapPage.exploreEvents")}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {appliedBounds ? (
                <button
                  type="button"
                  onClick={showAllEvents}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600"
                >
                  {t("mapPage.showAll")}
                </button>
              ) : null}
            </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain bg-slate-100 p-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] md:p-3">
            {visibleEvents.length === 0 ? (
              <EmptyMapEvents onShowAll={showAllEvents} />
            ) : (
              visibleEvents.map((event) => (
                <MapEventListCard
                  key={event.id}
                  event={event}
                  selected={event.id === selectedEventId}
                  onSelect={() => selectEvent(event)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {selectedEvent ? (
        <MobileEventPreview
          event={selectedEvent}
          onClose={() => setSelectedEventId(null)}
        />
      ) : null}
    </div>
  );
}

function MobileEventPreview({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const registrations = event.participantCount ?? 0;
  const unlimited = event.type !== "match" && isUnlimitedEventCapacity(event.maxParticipants);
  const mode = event.type === "match" ? getEventModeLabel(event.mode) : null;
  const price = getEventTournamentPriceLabel(event);

  return (
    <article className="absolute bottom-3 left-3 right-3 z-[1500] overflow-hidden rounded-[1.5rem] bg-white shadow-2xl ring-1 ring-slate-200 md:hidden">
      <button
        type="button"
        onClick={onClose}
        aria-label={t("mapPage.closeEventPreview")}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm"
      >
        <X size={16} />
      </button>

      <div className="flex gap-3 p-3 pr-12">
        <img
          src={getEventFallbackImage(event)}
          alt=""
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${getEventColorClasses(event)}`} />
            <p className="truncate text-base font-black text-slate-950">{event.title}</p>
          </div>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPin size={12} /> {event.locationName}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-600">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} />
              {new Date(event.startDate).toLocaleString(i18n.language, {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} />
              {unlimited ? registrations : `${registrations}/${event.maxParticipants}`}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-600">
              {mode ?? getEventTypeLabel(event.type)}
            </span>
            {price ? (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-amber-800">
                {price}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <Link
        to={`/events/${event.id}`}
        className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black text-blue-700"
      >
        {t("common.viewDetails")}
        <ChevronRight size={15} />
      </Link>
    </article>
  );
}

function MapEventListCard({
  event,
  selected,
  onSelect,
}: {
  event: Event;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t, i18n } = useTranslation();
  const registrations = event.participantCount ?? 0;
  const unlimited = event.type !== "match" && isUnlimitedEventCapacity(event.maxParticipants);
  const mode = event.type === "match" ? getEventModeLabel(event.mode) : null;
  const price = getEventTournamentPriceLabel(event);

  return (
    <article
      className={`overflow-hidden rounded-[1.35rem] border bg-white transition ${
        selected ? "border-blue-500 shadow-lg ring-2 ring-blue-200" : "border-slate-200 shadow-sm"
      }`}
    >
      <button type="button" onClick={onSelect} className="flex w-full gap-2.5 p-2.5 text-left md:gap-3 md:p-3">
        <img
          src={getEventFallbackImage(event)}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl object-cover md:h-16 md:w-16 md:rounded-2xl"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate text-sm font-black text-slate-950">{event.title}</span>
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getEventColorClasses(event)}`} />
          </span>
          <span className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPin size={12} /> {event.locationName}
          </span>
          <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-600">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} />
              {new Date(event.startDate).toLocaleString(i18n.language, {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} />
              {unlimited ? registrations : `${registrations}/${event.maxParticipants}`}
            </span>
          </span>
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-600">
              {mode ?? getEventTypeLabel(event.type)}
            </span>
            {price ? (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-amber-800">
                {price}
              </span>
            ) : null}
          </span>
        </span>
      </button>
      {selected ? (
        <Link
          to={`/events/${event.id}`}
          className="flex items-center justify-between border-t border-blue-100 bg-blue-50 px-4 py-2.5 text-xs font-black text-blue-700"
        >
          {t("common.viewDetails")}
          <ChevronRight size={15} />
        </Link>
      ) : null}
    </article>
  );
}

function MapLegend() {
  const { t } = useTranslation();
  return (
    <div className="absolute bottom-20 right-3 z-[1300] hidden flex-col gap-2 rounded-2xl bg-white/95 p-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 shadow-xl backdrop-blur md:flex">
      <LegendItem color="bg-emerald-500" label={t("mapPage.legendCasual")} />
      <LegendItem color="bg-violet-600" label={t("mapPage.legendCompetitive")} />
      <LegendItem color="bg-orange-500" label={t("mapPage.legendOpenPlay")} />
      <LegendItem color="bg-yellow-500" label={t("mapPage.legendTournament")} />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function EmptyMapEvents({ onShowAll }: { onShowAll: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-6 text-center">
      <MapPin className="mx-auto text-slate-300" size={30} />
      <p className="mt-3 font-black text-slate-950">{t("mapPage.emptyAreaTitle")}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{t("mapPage.emptyAreaBody")}</p>
      <button
        type="button"
        onClick={onShowAll}
        className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
      >
        {t("mapPage.showAll")}
      </button>
    </div>
  );
}
