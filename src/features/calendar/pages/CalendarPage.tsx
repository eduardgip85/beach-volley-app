import { useEffect, useState } from "react";
import { getPublicEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { EventsCalendar } from "../components/EventsCalendar";

export function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <section>
      {loading && <p className="text-slate-500">Loading calendar...</p>}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && <EventsCalendar events={events} />}
    </section>
  );
}
