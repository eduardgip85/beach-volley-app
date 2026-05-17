import { useEffect, useState } from "react";
import { EventFilters } from "../../../shared/components/EventFilters";
import { getPublicEvents } from "../../events/services/events.service";
import { useEventFilters } from "../../events/hooks/useEventFilters";
import type { Event } from "../../events/types/event.types";
import { EventsCalendar } from "../components/EventsCalendar";

export function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { filteredEvents, filters, locations, updateFilter, clearFilters } =
    useEventFilters(events);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Could not load calendar events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <section className="space-y-4">
      <EventFilters
        filters={filters}
        locations={locations}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      {loading && <p className="text-slate-500">Loading calendar...</p>}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && <EventsCalendar events={filteredEvents} />}
    </section>
  );
}
