import { MapPin, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { LocationPickerMap } from "../components/LocationPickerMap";
import {
  deleteEvent,
  getEventById,
  updateEvent,
} from "../services/events.service";
import { searchLocation } from "../services/geocoding.service";
import type { Event, EventType } from "../types/event.types";

function getDateValue(date: string) {
  return new Date(date).toISOString().slice(0, 10);
}

function getTimeValue(date: string) {
  return new Date(date).toTimeString().slice(0, 5);
}

export function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();

  const [eventData, setEventData] = useState<Event | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("match");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [locationName, setLocationName] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [latitude, setLatitude] = useState(41.3851);
  const [longitude, setLongitude] = useState(2.1734);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [error, setError] = useState("");

  const canManage = Boolean(
    profile && eventData && (profile.id === eventData.createdBy || isAdmin)
  );

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return;

      try {
        setLoading(true);
        setError("");

        const event = await getEventById(eventId);
        setEventData(event);

        setTitle(event.title);
        setDescription(event.description ?? "");
        setType(event.type);
        setDate(getDateValue(event.startDate));
        setTime(getTimeValue(event.startDate));
        setMaxParticipants(event.maxParticipants);
        setLocationName(event.locationName);
        setLatitude(event.latitude);
        setLongitude(event.longitude);
      } catch (err) {
        console.error(err);
        setError("Could not load event");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  async function handleSearchLocation() {
    if (!locationSearch.trim()) {
      setError("Write a location to search");
      return;
    }

    try {
      setSearchingLocation(true);
      setError("");

      const result = await searchLocation(locationSearch);

      if (!result) {
        setError("Location not found");
        return;
      }

      setLatitude(result.latitude);
      setLongitude(result.longitude);

      if (!locationName) {
        setLocationName(result.displayName);
      }
    } catch (err) {
      console.error(err);
      setError("Could not search location");
    } finally {
      setSearchingLocation(false);
    }
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    if (!eventId) return;

    if (!canManage) {
      setError("You do not have permission to edit this event");
      return;
    }

    if (!date || !time) {
      setError("Date and time are required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const startDate = new Date(`${date}T${time}`).toISOString();

      const updatedEvent = await updateEvent(eventId, {
        title,
        description,
        type,
        locationName,
        latitude,
        longitude,
        startDate,
        maxParticipants,
        imageUrl: eventData?.imageUrl ?? null,
      });

      navigate(`/events/${updatedEvent.id}`);
    } catch (err) {
      console.error(err);
      setError("Could not update event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!eventId) return;

    if (!canManage) {
      setError("You do not have permission to delete this event");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteEvent(eventId);

      navigate("/events", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Could not delete event");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading event...</p>;
  }

  if (error && !eventData) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Event not found</h1>
        <p className="mt-2 text-slate-500">{error}</p>
        <Link to="/events" className="mt-4 inline-block text-blue-600">
          Back to events
        </Link>
      </section>
    );
  }

  if (!eventData) return null;

  if (!canManage) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">No permission</h1>
        <p className="mt-2 text-slate-500">
          You can only edit events created by you.
        </p>
        <Link to={`/events/${eventData.id}`} className="mt-4 inline-block text-blue-600">
          Back to event
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Edit Event</h1>
          <p className="mt-2 text-slate-500">
            Update your beach volleyball event details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600 disabled:opacity-60"
        >
          <Trash2 size={18} />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8"
      >
        {error && (
          <p className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Title
            </label>
            <input
              placeholder="e.g. Saturday Sunset Scrimmage"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Event type
            </label>

            <div className="mt-2 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setType("match")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  type === "match"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Match
              </button>

              <button
                type="button"
                onClick={() => setType("tournament")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  type === "tournament"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Tournament
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Description
            </label>
            <textarea
              placeholder="Mention skill level, net height, and what to bring..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 min-h-32 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Max participants
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(event) =>
                setMaxParticipants(Number(event.target.value))
              }
              className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent focus:ring-blue-500"
              required
              min={1}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Location name
            </label>

            <div className="mt-2 flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 ring-1 ring-transparent focus-within:ring-blue-500">
              <MapPin size={18} className="text-slate-400" />
              <input
                placeholder="e.g. Barceloneta Beach Court 4"
                value={locationName}
                onChange={(event) => setLocationName(event.target.value)}
                className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Search location
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                placeholder="Search beach, city or area..."
                value={locationSearch}
                onChange={(event) => setLocationSearch(event.target.value)}
                className="w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={searchingLocation}
                className="rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60"
              >
                {searchingLocation ? "Searching..." : "Search"}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Search an approximate area first, then click on the map to adjust
              the exact meeting point.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Pin location
            </label>

            <div className="mt-2 h-64 overflow-hidden rounded-2xl bg-slate-100">
              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                onChange={(coords) => {
                  setLatitude(coords.latitude);
                  setLongitude(coords.longitude);
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Tap the map to adjust the precise meeting point. The exact
              coordinates are stored internally.
            </p>
          </div>

          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <button
              disabled={saving}
              className="rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white shadow-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/events/${eventData.id}`)}
              className="rounded-2xl bg-blue-50 px-5 py-4 font-bold text-blue-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}