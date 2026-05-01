import { MapPin } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { createEvent } from "../services/events.service";
import type { EventType } from "../types/event.types";
import { LocationPickerMap } from "../components/LocationPickerMap";
import { searchLocation } from "../services/geocoding.service";

export function CreateEventPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("match");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [maxParticipants, setMaxParticipants] = useState(8);
  const [locationName, setLocationName] = useState("");

  const [latitude, setLatitude] = useState(41.3851);
  const [longitude, setLongitude] = useState(2.1734);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [locationSearch, setLocationSearch] = useState("");
  const [searchingLocation, setSearchingLocation] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      setError("You need to be logged in to create an event");
      return;
    }

    if (!date || !time) {
      setError("Date and time are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const startDate = new Date(`${date}T${time}`).toISOString();

      const createdEvent = await createEvent(
        {
          title,
          description,
          type,
          locationName,
          latitude,
          longitude,
          startDate,
          maxParticipants: Number(maxParticipants),
          imageUrl: null,
        },
        profile.id
      );

      navigate(`/events/${createdEvent.id}`);
    } catch (err) {
      console.error(err);
      setError("Could not create event");
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-950">Create Event</h1>
        <p className="mt-2 text-slate-500">
          Set up your next beach volleyball match or tournament.
        </p>
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
              Search an approximate area first, then click on the map to adjust the exact
              meeting point.
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

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Tap the map to adjust the precise meeting point. The exact
                coordinates are stored internally.
              </p>

            </div>
          </div>

          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <button
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white shadow-sm disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/events")}
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