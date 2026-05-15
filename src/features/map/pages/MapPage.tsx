import { useEffect, useState } from "react";
import { EventFilters } from "../../../shared/components/EventFilters";
import { getPublicEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { useEventFilters } from "../../events/hooks/useEventFilters";
import { EventsMap } from "../components/EventsMap";

export function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    filteredEvents,
    filters,
    locations,
    updateFilter,
    clearFilters,
  } = useEventFilters(events);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Could not load map events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <section>

      <EventFilters
        filters={filters}
        locations={locations}
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
