import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { EventFilters } from "../../../shared/components/EventFilters";
import { EventCard } from "../components/EventCard";
import { useEventFilters } from "../hooks/useEventFilters";
import { useEventsPage } from "../hooks/useEventsPage";

export function EventsPage() {
  const { events, loading, error } = useEventsPage();

  const {
    filteredEvents,
    filters,
    locations,
    updateFilter,
    clearFilters,
  } = useEventFilters(events);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 px-4 bg-white rounded-xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
        </div>

        <Link
          to="/events/create"
          className="hidden rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 md:inline-flex"
        >
          Create Event
        </Link>

        <Link
          to="/events/create"
          className="fixed bottom-28 right-4 z-[1500] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700 active:scale-95 md:hidden"
        >
          <Plus size={24} />
        </Link>
      </div>

      <EventFilters
        filters={filters}
        locations={locations}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      {loading && (
        <p className="mt-8 text-sm text-slate-500">Loading events...</p>
      )}

      {error && (
        <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-slate-900">No events found</p>
          <p className="mt-2 text-sm text-slate-500">
            Try changing your filters or create a new event.
          </p>
        </div>
      )}

      {!loading && !error && filteredEvents.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
