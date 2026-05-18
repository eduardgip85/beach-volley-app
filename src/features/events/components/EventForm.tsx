import { MapPin } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { LocationPickerMap } from "./LocationPickerMap";
import type {
    EventMode,
    EventType,
    EventVisibility,
} from "../types/event.types";

interface EventFormProps {
    title: string;
    description: string;
    type: EventType;
    visibility: EventVisibility;
    mode: EventMode | null;
    date: string;
    time: string;
    maxParticipants: number;
    unlimitedParticipants: boolean;
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
    onMapLocationChange: (coords: {
        latitude: number;
        longitude: number;
    }) => void | Promise<void>;

    setTitle: Dispatch<SetStateAction<string>>;
    setDescription: Dispatch<SetStateAction<string>>;
    setType: Dispatch<SetStateAction<EventType>>;
    setVisibility: Dispatch<SetStateAction<EventVisibility>>;
    setMode: Dispatch<SetStateAction<EventMode | null>>;
    setDate: Dispatch<SetStateAction<string>>;
    setTime: Dispatch<SetStateAction<string>>;
    setMaxParticipants: Dispatch<SetStateAction<number>>;
    setUnlimitedParticipants: Dispatch<SetStateAction<boolean>>;
    setLocationSearch: Dispatch<SetStateAction<string>>;
}

export function EventForm({
    title,
    description,
    type,
    visibility,
    mode,
    date,
    time,
    maxParticipants,
    unlimitedParticipants,
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
    onMapLocationChange,
    setTitle,
    setDescription,
    setType,
    setVisibility,
    setMode,
    setDate,
    setTime,
    setMaxParticipants,
    setUnlimitedParticipants,
    setLocationSearch,
}: EventFormProps) {
    const typeHelperText =
        type === "match"
            ? "Structured 4-player game"
            : type === "open_play"
              ? "Flexible meetup with configurable participants"
              : "Coming soon";

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

                    <div className="mt-2 grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
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
                        onClick={() => setType("open_play")}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                            type === "open_play"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600"
                        }`}
                        >
                        Open Play
                        </button>

                        <button
                        type="button"
                        disabled
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                            type === "tournament"
                            ? "bg-slate-300 text-slate-700"
                            : "text-slate-400"
                        }`}
                        >
                        Tournament
                        <span className="block text-[11px] font-medium">
                            Coming soon
                        </span>
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">{typeHelperText}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                            Visibility
                        </label>

                        <select
                            value={visibility}
                            onChange={(event) =>
                                setVisibility(event.target.value as EventVisibility)
                            }
                            className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent focus:ring-blue-500"
                            required
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>

                    {type === "match" && (
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                Mode
                            </label>

                            <select
                                value={mode ?? ""}
                                onChange={(event) =>
                                    setMode(event.target.value as EventMode)
                                }
                                className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent focus:ring-blue-500"
                                required
                            >
                                <option value="casual">Casual</option>
                                <option value="competitive">Competitive</option>
                            </select>
                        </div>
                    )}
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
                        {type === "match" ? "Max participants" : "Participant limit"}
                    </label>

                    {type === "match" ? (
                        <>
                            <input
                                type="number"
                                value={4}
                                readOnly
                                className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Matches are locked to 4 participants.
                            </p>
                        </>
                    ) : (
                        <>
                            <label className="mt-3 inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={unlimitedParticipants}
                                    onChange={(event) =>
                                        setUnlimitedParticipants(event.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                Unlimited spots
                            </label>

                            <input
                                type="number"
                                value={unlimitedParticipants ? "" : maxParticipants}
                                onChange={(event) =>
                                    setMaxParticipants(Number(event.target.value))
                                }
                                className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent focus:ring-blue-500 disabled:text-slate-400"
                                min={1}
                                disabled={unlimitedParticipants}
                                placeholder="e.g. 12"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                {unlimitedParticipants
                                    ? "Anyone can join this session."
                                    : "Set a limit only if you want to cap the group size."}
                            </p>
                        </>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        Location name
                    </label>

                    <div className="mt-2 flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 ring-1 ring-transparent focus-within:ring-blue-500">
                        <MapPin size={18} className="text-slate-400" />
                        <input
                        placeholder="Search or click on the map to fill this automatically"
                        value={locationName}
                        className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                        required
                        readOnly
                        />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                        This name now comes from the selected coordinates to keep
                        locations real and consistent in filters.
                    </p>
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
                        onChange={onMapLocationChange}
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
