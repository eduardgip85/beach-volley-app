import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../services/events.service";
import type { Event } from "../types/event.types";
import { EventCard } from "../components/EventCard";

export function EventsPage() {
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
        setError("Could not load events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="mt-2 text-slate-500">
            Explore beach volleyball matches and tournaments.
          </p>
        </div>

        <Link
          to="/events/create"
          className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white"
        >
          Create Event
        </Link>
      </div>

      {loading && (
        <p className="mt-8 text-sm text-slate-500">Loading events...</p>
      )}

      {error && (
        <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-slate-900">No events yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Create the first beach volley event.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
    </section>
  );
}