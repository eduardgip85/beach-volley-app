import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteEvent, getEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import {
  getEventBadgeClasses,
  getEventDisplayStatus,
  getEventModeLabel,
  getEventTypeLabel,
  getEventVisibilityBadgeClasses,
  getEventVisibilityLabel,
} from "../../events/utils/event-display.utils";

export function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleDelete(eventId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(eventId);
      setError("");

      await deleteEvent(eventId);

      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== eventId)
      );
    } catch (err) {
      console.error(err);
      setError("Could not delete event");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="text-slate-500">Loading events...</p>;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Events Management
        </h1>

        <Link
          to="/profile"
          className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white"
        >
          Back
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4 md:hidden">
        {events.map((event) => {
          const modeLabel =
            event.type === "match" ? getEventModeLabel(event.mode) : null;

          return (
            <article key={event.id} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                        event
                      )}`}
                    >
                      {getEventTypeLabel(event.type)}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventVisibilityBadgeClasses(
                        event.visibility
                      )}`}
                    >
                      {getEventVisibilityLabel(event.visibility)}
                    </span>

                    {modeLabel && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {modeLabel}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-slate-900">
                    {event.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {event.locationName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(event.startDate).toLocaleString()}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {getEventDisplayStatus(event)}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  className="rounded-2xl bg-red-50 p-3 text-red-600 disabled:opacity-50"
                  aria-label={`Delete ${event.title}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  to={`/events/${event.id}`}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white"
                >
                  View
                </Link>

                <Link
                  to={`/events/${event.id}/edit`}
                  className="rounded-2xl bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700"
                >
                  Edit
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-3xl bg-white shadow-sm md:block">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Location</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => {
              const modeLabel =
                event.type === "match" ? getEventModeLabel(event.mode) : null;

              return (
                <tr key={event.id} className="border-t">
                  <td className="p-4 font-semibold">{event.title}</td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                          event
                        )}`}
                      >
                        {getEventTypeLabel(event.type)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventVisibilityBadgeClasses(
                          event.visibility
                        )}`}
                      >
                        {getEventVisibilityLabel(event.visibility)}
                      </span>

                      {modeLabel && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {modeLabel}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-sm text-slate-500">
                    {event.locationName}
                  </td>

                  <td className="p-4 text-sm text-slate-500">
                    <div>{new Date(event.startDate).toLocaleString()}</div>
                    <div className="mt-1 font-semibold text-slate-700">
                      {getEventDisplayStatus(event)}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/events/${event.id}`}
                        className="rounded-2xl px-2 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        View
                      </Link>

                      <Link
                        to={`/events/${event.id}/edit`}
                        className="rounded-2xl px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={deletingId === event.id}
                        className="inline-flex items-center gap-1 rounded-2xl px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        {deletingId === event.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {events.length === 0 && (
        <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-slate-900">No events found</p>
          <p className="mt-2 text-sm text-slate-500">
            Events created by users will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
