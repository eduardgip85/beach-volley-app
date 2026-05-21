import { AlertCircle, MapPin, X } from "lucide-react";
import { useEffect } from "react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
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
    onDismissError?: () => void;

    submitLabel: string;
    submittingLabel: string;
    cancelLabel?: string;
    extraActions?: ReactNode;

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

const hourOptions = Array.from({ length: 24 }, (_, index) =>
    index.toString().padStart(2, "0")
);
const minuteOptions = ["00", "15", "30", "45"];

function getTimeParts(time: string) {
    const [rawHours = "", rawMinutes = ""] = time.split(":");

    return {
        hours: rawHours,
        minutes: rawMinutes,
    };
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
    onDismissError,
    submitLabel,
    submittingLabel,
    cancelLabel,
    extraActions,
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
    const { t } = useTranslation();

    const resolvedCancelLabel = cancelLabel ?? t("eventForm.cancel");
    const timeParts = getTimeParts(time);
    const typeHelperText =
        type === "match"
            ? t("eventForm.typeHelperMatch")
            : type === "open_play"
              ? t("eventForm.typeHelperOpenPlay")
              : t("eventForm.typeHelperTournament");

    useEffect(() => {
        if (!error || !onDismissError) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            onDismissError();
        }, 5000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [error, onDismissError]);

    function handleHourChange(nextHours: string) {
        setTime(`${nextHours}:${timeParts.minutes || "00"}`);
    }

    function handleMinuteChange(nextMinutes: string) {
        setTime(`${timeParts.hours || "00"}:${nextMinutes}`);
    }

    return (
        <>
            {error ? (
                <div className="fixed right-4 top-4 z-[2300] w-[min(24rem,calc(100vw-2rem))]">
                    <div
                        role="alert"
                        className="rounded-3xl border border-red-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(239,68,68,0.18)] ring-1 ring-red-100 backdrop-blur-md"
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-2xl bg-red-50 p-2 text-red-600">
                                <AlertCircle size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-slate-950">
                                    {t("eventForm.errors.title")}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {error}
                                </p>
                            </div>

                            {onDismissError ? (
                                <button
                                    type="button"
                                    onClick={onDismissError}
                                    className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X size={16} />
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

            <form
                onSubmit={onSubmit}
                className="rounded-4xl bg-white p-6 shadow-sm md:p-8"
            >

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        {t("eventForm.title")}
                    </label>
                    <input
                        placeholder={t("eventForm.titlePlaceholder")}
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        {t("eventForm.eventType")}
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
                            {t("eventTypes.match")}
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
                            {t("eventTypes.open_play")}
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
                            {t("eventTypes.tournament")}
                            <span className="block text-[11px] font-medium">
                                {t("eventForm.tournamentComingSoon")}
                            </span>
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">{typeHelperText}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                            {t("eventForm.visibility")}
                        </label>

                        <div className="mt-2 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() => setVisibility("public")}
                                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                    visibility === "public"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-600"
                                }`}
                            >
                                {t("eventVisibility.public")}
                            </button>

                            <button
                                type="button"
                                onClick={() => setVisibility("private")}
                                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                    visibility === "private"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-600"
                                }`}
                            >
                                {t("eventVisibility.private")}
                            </button>
                        </div>
                    </div>

                    {type === "match" && (
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                {t("eventForm.mode")}
                            </label>

                            <div className="mt-2 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setMode("casual")}
                                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        mode === "casual"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-slate-600"
                                    }`}
                                >
                                    {t("eventModes.casual")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMode("competitive")}
                                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        mode === "competitive"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-slate-600"
                                    }`}
                                >
                                    {t("eventModes.competitive")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        {t("eventForm.description")}
                    </label>
                    <textarea
                        placeholder={t("eventForm.descriptionPlaceholder")}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="mt-2 min-h-32 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-blue-500"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                            {t("eventForm.date")}
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
                            {t("eventForm.time")}
                        </label>
                        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 ring-1 ring-transparent focus-within:ring-blue-500">
                            <select
                                value={timeParts.hours}
                                onChange={(event) => handleHourChange(event.target.value)}
                                className="rounded-xl border-0 bg-white px-3 py-2 text-slate-900 outline-none"
                                required
                            >
                                <option value="" disabled>
                                    HH
                                </option>
                                {hourOptions.map((hour) => (
                                    <option key={hour} value={hour}>
                                        {hour}
                                    </option>
                                ))}
                            </select>

                            <span className="text-sm font-bold text-slate-500">:</span>

                            <select
                                value={timeParts.minutes}
                                onChange={(event) => handleMinuteChange(event.target.value)}
                                className="rounded-xl border-0 bg-white px-3 py-2 text-slate-900 outline-none"
                                required
                            >
                                <option value="" disabled>
                                    MM
                                </option>
                                {minuteOptions.map((minute) => (
                                    <option key={minute} value={minute}>
                                        {minute}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        {type === "match"
                            ? t("eventForm.maxParticipants")
                            : t("eventForm.participantLimit")}
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
                                {t("eventForm.matchesLocked")}
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
                                {t("eventForm.unlimitedSpots")}
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
                                placeholder={t("eventForm.participantPlaceholder")}
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                {unlimitedParticipants
                                    ? t("eventForm.unlimitedBody")
                                    : t("eventForm.limitedBody")}
                            </p>
                        </>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        {t("eventForm.searchLocation")}
                    </label>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                        <input
                            placeholder={t("eventForm.searchLocationPlaceholder")}
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
                            {searchingLocation
                                ? t("eventForm.searching")
                                : t("eventForm.search")}
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                        {t("eventForm.searchLocationBody")}
                    </p>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        {t("eventForm.locationName")}
                    </label>

                    <div className="mt-2 flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 ring-1 ring-transparent focus-within:ring-blue-500">
                        <MapPin size={18} className="text-slate-400" />
                        <input
                            placeholder={t("eventForm.locationNamePlaceholder")}
                            value={locationName}
                            className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                            required
                            readOnly
                        />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                        {t("eventForm.locationNameBody")}
                    </p>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        {t("eventForm.pinLocation")}
                    </label>

                    <div className="mt-2 h-64 overflow-hidden rounded-2xl bg-slate-100">
                        <LocationPickerMap
                            latitude={latitude}
                            longitude={longitude}
                            onChange={onMapLocationChange}
                        />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                        {t("eventForm.pinLocationBody")}
                    </p>
                </div>

                <div
                    className={`grid gap-3 pt-4 ${
                        extraActions ? "sm:grid-cols-3" : "sm:grid-cols-2"
                    }`}
                >
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
                        {resolvedCancelLabel}
                    </button>

                    {extraActions}
                </div>
            </div>
        </form>
        </>
    );
}
