import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { getEventById } from "../services/events.service";
import type { Event } from "../types/event.types";

export function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canEdit = Boolean(profile && event && profile.id === event.createdBy);

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return;

      try {
        setLoading(true);
        setError("");

        const data = await getEventById(eventId);
        setEvent(data);
      } catch (err) {
        console.error(err);
        setError("Could not load event");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  function handleJoinEvent() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${eventId}`);
      return;
    }

    alert("Registrations will be implemented in the next phase");
  }

  if (loading) {
    return <p className="text-slate-500">Loading event...</p>;
  }

  if (error || !event) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Event not found</h1>
        <p className="mt-2 text-slate-500">{error}</p>
        <Link to="/events" className="mt-4 inline-block text-blue-600">
          Back to events
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium capitalize text-blue-700">
          {event.type}
        </span>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          {event.title}
        </h1>

        <p className="mt-3 text-slate-600">
          {event.description || "No description provided."}
        </p>

        <div className="mt-6 space-y-2 text-sm text-slate-600">
          <p>Date: {new Date(event.startDate).toLocaleString()}</p>
          <p>Location: {event.locationName}</p>
          <p>Max participants: {event.maxParticipants}</p>
          <p>Status: {event.status}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleJoinEvent}
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white"
          >
            Join Event
          </button>

          {canEdit && (
            <Link
              to={`/events/${event.id}/edit`}
              className="rounded-xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-700"
            >
              Edit Event
            </Link>
          )}
        </div>
      </div>

      <aside className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Location</h2>

        <div className="mt-4 flex h-64 items-center justify-center rounded-2xl bg-slate-100 text-center text-slate-500">
          Lat: {event.latitude}
          <br />
          Lng: {event.longitude}
        </div>
      </aside>
    </section>
  );
}