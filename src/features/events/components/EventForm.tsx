import { MapPin } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { LocationPickerMap } from "./LocationPickerMap";
import type { EventType } from "../types/event.types";

interface EventFormProps {
    title: string;
    description: string;
    type: EventType;
    date: string;
    time: string;
    maxParticipants: number;
    locationName: string;
    latitude: number;
    longitude: number;
    locationSearch: string;

    error: string;
    submitting: boolean;
    searchingLocation: boolean;

    submitLabel: string;
    submittingLabel: string;
    cancelLabel?: string;

    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    onSearchLocation: () => void;

    setTitle: Dispatch<SetStateAction<string>>;
    setDescription: Dispatch<SetStateAction<string>>;
    setType: Dispatch<SetStateAction<EventType>>;
    setDate: Dispatch<SetStateAction<string>>;
    setTime: Dispatch<SetStateAction<string>>;
    setMaxParticipants: Dispatch<SetStateAction<number>>;
    setLocationName: Dispatch<SetStateAction<string>>;
    setLatitude: Dispatch<SetStateAction<number>>;
    setLongitude: Dispatch<SetStateAction<number>>;
    setLocationSearch: Dispatch<SetStateAction<string>>;
}

export function EventForm({
    title,
    description,
    type,
    date,
    time,
    maxParticipants,
    locationName,
    latitude,
    longitude,
    locationSearch,
    error,
    submitting,
    searchingLocation,
    submitLabel,
    submittingLabel,
    cancelLabel = "Cancel",
    onSubmit,
    onCancel,
    onSearchLocation,
    setTitle,
    setDescription,
    setType,
    setDate,
    setTime,
    setMaxParticipants,
    setLocationName,
    setLatitude,
    setLongitude,
    setLocationSearch,
}: EventFormProps) {
    return (
        <form
        onSubmit={onSubmit}
        className="rounded-4xl bg-white p-6 shadow-sm md:p-8"
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
                        onChange={(event) => setMaxParticipants(Number(event.target.value))}
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
                        onClick={onSearchLocation}
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
                        disabled={submitting}
                        className="rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white shadow-sm disabled:opacity-60"
                    >
                        {submitting ? submittingLabel : submitLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-2xl bg-blue-50 px-5 py-4 font-bold text-blue-700"
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}