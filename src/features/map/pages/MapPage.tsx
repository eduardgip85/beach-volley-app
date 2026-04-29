import { useEffect, useState } from "react";
import { getEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { EventsMap } from "../components/EventsMap";

export function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await getEvents();
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Map</h1>
        <p className="mt-2 text-slate-500">
          Explore active beach volleyball matches and tournaments by location.
        </p>
      </div>

      {loading && <p className="text-slate-500">Loading map...</p>}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="h-[calc(100vh-160px)] min-h-[500px] overflow-hidden rounded-3xl bg-white p-2 shadow-sm">
          <EventsMap events={events} />
        </div>
      )}
    </section>
  );
}