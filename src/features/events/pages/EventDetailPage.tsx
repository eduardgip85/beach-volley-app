import { CalendarDays, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import {
  getEventRegistrationsCount,
  isUserRegistered,
  registerToEvent,
  unregisterFromEvent,
} from "../../registrations/services/registrations.service";
import { getEventById } from "../services/events.service";
import type { Event } from "../types/event.types";
import { EventLocationMap } from "../components/EventLocationMap";

export function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile, isAdmin } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const canEdit = Boolean(
    profile && event && (profile.id === event.createdBy || isAdmin)
  );

  const isFull = event
    ? registrationsCount >= event.maxParticipants
    : false;

  async function loadRegistrationState(currentEventId: string) {
    const count = await getEventRegistrationsCount(currentEventId);
    setRegistrationsCount(count);

    if (profile) {
      const joined = await isUserRegistered(currentEventId, profile.id);
      setAlreadyJoined(joined);
    } else {
      setAlreadyJoined(false);
    }
  }

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return;

      try {
        setLoading(true);
        setError("");

        const eventData = await getEventById(eventId);
        setEvent(eventData);

        await loadRegistrationState(eventId);
      } catch (err) {
        console.error(err);
        setError("Could not load event");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId, profile?.id]);

  async function handleJoinEvent() {
    if (!eventId) return;

    if (!isAuthenticated || !profile) {
      navigate(`/login?redirect=/events/${eventId}`);
      return;
    }

    if (alreadyJoined) {
      return;
    }

    if (isFull) {
      return;
    }

    try {
      setJoining(true);
      setError("");

      await registerToEvent(eventId, profile.id);
      await loadRegistrationState(eventId);
    } catch (err) {
      console.error(err);
      setError("Could not join this event");
    } finally {
      setJoining(false);
    }
  }

  async function handleLeaveEvent() {
    if (!eventId || !profile) return;

    try {
      setJoining(true);
      setError("");

      await unregisterFromEvent(eventId, profile.id);
      await loadRegistrationState(eventId);
    } catch (err) {
      console.error(err);
      setError("Could not leave this event");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading event...</p>;
  }

  if (error && !event) {
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

  if (!event) return null;

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase text-white ${
            event.type === "match" ? "bg-emerald-500" : "bg-blue-600"
          }`}
        >
          {event.type}
        </span>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          {event.title}
        </h1>

        <p className="mt-3 text-slate-600">
          {event.description || "No description provided."}
        </p>

        {error && (
          <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4">
            <CalendarDays size={18} className="text-blue-600" />
            {new Date(event.startDate).toLocaleString()}
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4">
            <MapPin size={18} className="text-blue-600" />
            {event.locationName}
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4">
            <Users size={18} className="text-blue-600" />
            {registrationsCount}/{event.maxParticipants} joined
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 capitalize">
            Status: {event.status}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {!alreadyJoined ? (
            <button
              onClick={handleJoinEvent}
              disabled={joining || isFull}
              className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFull
                ? "Event Full"
                : joining
                  ? "Joining..."
                  : "Join Event"}
            </button>
          ) : (
            <button
              onClick={handleLeaveEvent}
              disabled={joining}
              className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600 disabled:opacity-60"
            >
              {joining ? "Leaving..." : "Leave Event"}
            </button>
          )}

          {canEdit && (
            <Link
              to={`/events/${event.id}/edit`}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-center font-bold text-slate-700"
            >
              Edit Event
            </Link>
          )}
        </div>
      </div>

      <aside className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Location</h2>

        <div className="mt-4 h-64 overflow-hidden rounded-2xl bg-slate-100">
          <EventLocationMap
            latitude={event.latitude}
            longitude={event.longitude}
            title={event.title}
            locationName={event.locationName}
          />
        </div>
        
      </aside>
    </section>
  );
}