import { useEffect, useState } from "react";
import { getEvents } from "../../events/services/events.service";
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

        const data = await getEvents();
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="mt-2 text-slate-500">
          Check upcoming beach volleyball matches and tournaments.
        </p>
      </div>

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