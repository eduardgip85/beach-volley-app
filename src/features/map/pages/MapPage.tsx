import { useEffect, useState } from "react";
import { EventFilters } from "../../../shared/components/EventFilters";
import { useAuth } from "../../auth/context/AuthContext";
import { getAccessibleEventsForUser } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { useEventFilters } from "../../events/hooks/useEventFilters";
import { isPastEvent } from "../../events/utils/event-display.utils";
import { EventsMap } from "../components/EventsMap";

export function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [myEventIds, setMyEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { profile } = useAuth();
  const visibleEvents = events.filter(
    (event) => event.status === "active" && !isPastEvent(event)
  );

  const {
    filteredEvents,
    filters,
    locations,
    updateFilter,
    clearFilters,
  } = useEventFilters(visibleEvents, {
    isMyEvent: (event) => myEventIds.includes(event.id),
  });

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const result = await getAccessibleEventsForUser(profile?.id);
        setEvents(result.events);
        setMyEventIds(result.myEventIds);
      } catch (err) {
        console.error(err);
        setError("Could not load map events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [profile?.id]);

  return (
    <section>

      <EventFilters
        filters={filters}
        locations={locations}
        showMyEventsFilter={Boolean(profile)}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      {loading && <p className="mt-8 text-slate-500">Loading map...</p>}

      {error && (
        <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-6 h-[65vh] min-h-[360px] overflow-hidden rounded-3xl bg-white p-2 shadow-sm md:h-[calc(100vh-240px)] md:min-h-[600px]">

          <EventsMap events={filteredEvents} />
        </div>
      )}
    </section>
  );
}
