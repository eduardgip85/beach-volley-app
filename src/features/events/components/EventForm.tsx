import { AlertCircle, HelpCircle, Info, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { LocationPickerMap } from "./LocationPickerMap";
import { getEventCoverOptions } from "../constants/eventCoverOptions";
import {
    getTournamentTeamSize,
    type EventMode,
    type EventType,
    type EventVisibility,
    type TournamentBracketType,
    type TournamentEntryFeeType,
    type TournamentRegistrationType,
    type TournamentTeamFormat,
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
    tournamentRegistrationType: TournamentRegistrationType;
    tournamentTeamFormat: TournamentTeamFormat;
    tournamentEntryFeeType: TournamentEntryFeeType;
    tournamentEntryFeeAmount: string;
    tournamentBracketType: TournamentBracketType;
    tournamentMaxTeams: number;
    tournamentCourtCount: number;
    locationName: string;
    latitude: number;
    longitude: number;
    locationSearch: string;
    imageUrl: string | null;

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
    setTournamentRegistrationType: Dispatch<
        SetStateAction<TournamentRegistrationType>
    >;
    setTournamentTeamFormat: Dispatch<SetStateAction<TournamentTeamFormat>>;
    setTournamentEntryFeeType: Dispatch<SetStateAction<TournamentEntryFeeType>>;
    setTournamentEntryFeeAmount: Dispatch<SetStateAction<string>>;
    setTournamentBracketType: Dispatch<SetStateAction<TournamentBracketType>>;
    setTournamentMaxTeams: Dispatch<SetStateAction<number>>;
    setTournamentCourtCount: Dispatch<SetStateAction<number>>;
    setLocationSearch: Dispatch<SetStateAction<string>>;
    setImageUrl: Dispatch<SetStateAction<string | null>>;
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

function getSegmentButtonClass(isSelected: boolean, selectedClasses: string) {
    return `rounded-xl px-4 py-3 text-sm font-semibold transition ${
        isSelected
            ? `${selectedClasses} shadow-sm`
            : "text-slate-600 hover:text-slate-900"
    }`;
}

function getEventConfigurationSurfaceClasses(
    eventType: EventType,
    currentMode: EventMode | null
) {
    if (eventType === "open_play") {
        return {
            wrapper: "border border-orange-100 bg-orange-50/80",
            eyebrow: "text-orange-700",
        };
    }

    if (eventType === "tournament") {
        return {
            wrapper: "border border-yellow-100 bg-yellow-50/80",
            eyebrow: "text-yellow-700",
        };
    }

    if (currentMode === "competitive") {
        return {
            wrapper: "border border-violet-100 bg-violet-50/80",
            eyebrow: "text-violet-700",
        };
    }

    return {
        wrapper: "border border-emerald-100 bg-emerald-50/80",
        eyebrow: "text-emerald-700",
    };
}

function getEventTypeSelectionClasses(
    eventType: EventType,
    currentMode: EventMode | null
) {
    if (eventType === "open_play") {
        return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
    }

    if (eventType === "tournament") {
        return "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200";
    }

    return currentMode === "competitive"
        ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
        : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
}

function getBracketCardClass(
    bracketType: TournamentBracketType,
    isSelected: boolean
) {
    if (!isSelected) {
        return "border-slate-200 bg-white/80 hover:border-slate-300";
    }

    switch (bracketType) {
        case "round_robin":
            return "border-emerald-400 bg-white shadow-sm ring-2 ring-emerald-200";
        case "group_knockout":
            return "border-violet-400 bg-white shadow-sm ring-2 ring-violet-200";
        case "double_elimination":
            return "border-amber-400 bg-white shadow-sm ring-2 ring-amber-200";
        default:
            return "border-blue-500 bg-white shadow-sm ring-2 ring-blue-200";
    }
}

function getEventConfigurationCopy(
    eventType: EventType,
    currentMode: EventMode | null,
    t: (key: string) => string
) {
    if (eventType === "open_play") {
        return {
            eyebrow: t("eventForm.configuration.openPlayEyebrow"),
            title: t("eventForm.configuration.openPlayTitle"),
            body: t("eventForm.configuration.openPlayBody"),
            extra: t("eventForm.configuration.openPlayExtra"),
        };
    }

    if (eventType === "tournament") {
        return {
            eyebrow: t("eventForm.tournament.eyebrow"),
            title: t("eventForm.tournament.title"),
            body: t("eventForm.tournament.body"),
            extra: "",
        };
    }

    return {
        eyebrow:
            currentMode === "competitive"
                ? t("eventForm.configuration.competitiveMatchEyebrow")
                : t("eventForm.configuration.matchEyebrow"),
        title:
            currentMode === "competitive"
                ? t("eventForm.configuration.competitiveMatchTitle")
                : t("eventForm.configuration.matchTitle"),
        body:
            currentMode === "competitive"
                ? t("eventForm.configuration.competitiveMatchBody")
                : t("eventForm.configuration.matchBody"),
        extra:
            currentMode === "competitive"
                ? t("eventForm.configuration.competitiveMatchExtra")
                : t("eventForm.configuration.matchExtra"),
    };
}

function FormSectionCard({
    title,
    body,
    children,
    className = "",
}: {
    title: string;
    body?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`rounded-3xl border border-slate-200 bg-slate-50/70 p-5 ${className}`}
        >
            <div>
                <h3 className="text-lg font-black text-slate-950">{title}</h3>
                {body ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                ) : null}
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
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
    tournamentRegistrationType,
    tournamentTeamFormat,
    tournamentEntryFeeType,
    tournamentEntryFeeAmount,
    tournamentBracketType,
    tournamentMaxTeams,
    tournamentCourtCount,
    locationName,
    latitude,
    longitude,
    locationSearch,
    imageUrl,
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
    setTournamentRegistrationType,
    setTournamentTeamFormat,
    setTournamentEntryFeeType,
    setTournamentEntryFeeAmount,
    setTournamentBracketType,
    setTournamentMaxTeams,
    setTournamentCourtCount,
    setLocationSearch,
    setImageUrl,
}: EventFormProps) {
    const { t } = useTranslation();
    const [isRegistrationHelpOpen, setIsRegistrationHelpOpen] = useState(false);
    const [isBracketHelpOpen, setIsBracketHelpOpen] = useState(false);

    const resolvedCancelLabel = cancelLabel ?? t("eventForm.cancel");
    const timeParts = getTimeParts(time);
    const tournamentTeamSize = getTournamentTeamSize(tournamentTeamFormat);
    const tournamentParticipantCapacity =
        tournamentMaxTeams * tournamentTeamSize;
    const eventConfigurationSurface = getEventConfigurationSurfaceClasses(
        type,
        mode
    );
    const eventConfigurationCopy = getEventConfigurationCopy(type, mode, t);
    const typeHelperText =
        type === "match"
            ? t("eventForm.typeHelperMatch")
            : type === "open_play"
              ? t("eventForm.typeHelperOpenPlay")
              : t("eventForm.typeHelperTournament");
    const bracketCards: Array<{
        value: TournamentBracketType;
        title: string;
        body: string;
        recommendation: string;
    }> = [
        {
            value: "single_elimination",
            title: t("eventForm.tournament.brackets.singleElimination"),
            body: t("eventForm.tournament.brackets.singleEliminationBody"),
            recommendation: t("eventForm.tournament.brackets.singleEliminationRecommendation"),
        },
        {
            value: "round_robin",
            title: t("eventForm.tournament.brackets.roundRobin"),
            body: t("eventForm.tournament.brackets.roundRobinBody"),
            recommendation: t("eventForm.tournament.brackets.roundRobinRecommendation"),
        },
        {
            value: "group_knockout",
            title: t("eventForm.tournament.brackets.groupKnockout"),
            body: t("eventForm.tournament.brackets.groupKnockoutBody"),
            recommendation: t("eventForm.tournament.brackets.groupKnockoutRecommendation"),
        },
        {
            value: "double_elimination",
            title: t("eventForm.tournament.brackets.doubleElimination"),
            body: t("eventForm.tournament.brackets.doubleEliminationBody"),
            recommendation: t("eventForm.tournament.brackets.doubleEliminationRecommendation"),
        },
    ];
    const coverOptions = getEventCoverOptions(type);

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

    useEffect(() => {
        if (!isBracketHelpOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsBracketHelpOpen(false);
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [isBracketHelpOpen]);

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

            {isRegistrationHelpOpen ? (
                <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
                                    {t("eventForm.tournament.registrationHelpEyebrow")}
                                </p>
                                <h3 className="mt-2 text-xl font-black text-slate-950">
                                    {t("eventForm.tournament.registrationHelpTitle")}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {t("eventForm.tournament.registrationHelpBody")}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsRegistrationHelpOpen(false)}
                                aria-label={t("eventForm.tournament.registrationHelpClose")}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="mt-5 grid gap-3">
                            <div className="rounded-2xl border border-yellow-100 bg-yellow-50/80 p-4">
                                <p className="text-sm font-bold text-slate-900">
                                    {t("eventForm.tournament.registrationHelpTeamTitle")}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {t("eventForm.tournament.registrationHelpTeamBody")}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-4">
                                <p className="text-sm font-bold text-slate-900">
                                    {t("eventForm.tournament.registrationHelpIndividualTitle")}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {t("eventForm.tournament.registrationHelpIndividualBody")}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsRegistrationHelpOpen(false)}
                                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
                            >
                                {t("eventForm.tournament.registrationHelpClose")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {isBracketHelpOpen ? (
                <div className="fixed inset-0 z-[2400] flex items-center justify-center p-3 sm:p-6">
                    <button
                        type="button"
                        aria-label={t("eventForm.tournament.bracketHelpClose")}
                        onClick={() => setIsBracketHelpOpen(false)}
                        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
                    />

                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="bracket-help-title"
                        className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.3)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]"
                    >
                        <header className="relative shrink-0 border-b border-slate-200 bg-[linear-gradient(135deg,_#fffbea_0%,_#f8fafc_60%,_#eef6ff_100%)] p-5 pr-16 sm:p-7 sm:pr-20">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">
                                {t("eventForm.tournament.bracketHelpEyebrow")}
                            </p>
                            <h3
                                id="bracket-help-title"
                                className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl"
                            >
                                {t("eventForm.tournament.bracketHelpTitle")}
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                {t("eventForm.tournament.bracketHelpBody")}
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsBracketHelpOpen(false)}
                                aria-label={t("eventForm.tournament.bracketHelpClose")}
                                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-950 sm:right-6 sm:top-6"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-100 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
                            <div className="grid gap-3 md:grid-cols-2">
                                {bracketCards.map((bracketCard) => (
                                    <article
                                        key={bracketCard.value}
                                        className={`rounded-[1.5rem] border bg-white p-5 shadow-sm ${
                                            tournamentBracketType === bracketCard.value
                                                ? getBracketCardClass(bracketCard.value, true)
                                                : "border-slate-200"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h4 className="text-lg font-black text-slate-950">
                                                {bracketCard.title}
                                            </h4>
                                            {tournamentBracketType === bracketCard.value ? (
                                                <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                                                    {t("eventForm.tournament.bracketHelpSelected")}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {t(`eventForm.tournament.brackets.${bracketCard.value}Detail`)}
                                        </p>
                                        <div className="mt-4 rounded-2xl bg-slate-100 p-3">
                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                {t("eventForm.tournament.bracketHelpRecommended")}
                                            </p>
                                            <p className="mt-1 text-sm font-black text-slate-950">
                                                {bracketCard.recommendation}
                                            </p>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                            <p className="rounded-2xl bg-emerald-50 p-3 leading-5 text-emerald-900">
                                                <strong>{t("eventForm.tournament.bracketHelpIdeal")}:</strong>{" "}
                                                {t(`eventForm.tournament.brackets.${bracketCard.value}Ideal`)}
                                            </p>
                                            <p className="rounded-2xl bg-amber-50 p-3 leading-5 text-amber-900">
                                                <strong>{t("eventForm.tournament.bracketHelpConsider")}:</strong>{" "}
                                                {t(`eventForm.tournament.brackets.${bracketCard.value}Consider`)}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            ) : null}

            <form
                onSubmit={onSubmit}
                className="rounded-4xl bg-white p-6 shadow-sm md:p-8"
            >
                <div className="space-y-6">
                    <FormSectionCard
                        title={t("eventForm.detailsTitle")}
                        body={t("eventForm.detailsBody")}
                    >
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                    {t("eventForm.title")}
                                </label>
                                <input
                                    placeholder={t("eventForm.titlePlaceholder")}
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                    {t("eventForm.description")}
                                </label>
                                <textarea
                                    placeholder={t("eventForm.descriptionPlaceholder")}
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    className="mt-2 min-h-32 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </FormSectionCard>

                    <section
                        className={`space-y-6 rounded-3xl p-5 ${eventConfigurationSurface.wrapper}`}
                    >
                        <div>
                            <p
                                className={`text-xs font-bold uppercase tracking-widest ${eventConfigurationSurface.eyebrow}`}
                            >
                                {eventConfigurationCopy.eyebrow}
                            </p>
                            <h3 className="mt-2 text-lg font-black text-slate-950">
                                {eventConfigurationCopy.title}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600">
                                {eventConfigurationCopy.body}
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                {t("eventForm.eventType")}
                            </label>

                            <div className="mt-2 grid grid-cols-3 rounded-2xl bg-white p-1">
                                <button
                                    type="button"
                                    onClick={() => setType("match")}
                                    className={getSegmentButtonClass(
                                        type === "match",
                                        getEventTypeSelectionClasses("match", mode)
                                    )}
                                >
                                    {t("eventTypes.match")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setType("open_play")}
                                    className={getSegmentButtonClass(
                                        type === "open_play",
                                        getEventTypeSelectionClasses("open_play", mode)
                                    )}
                                >
                                    {t("eventTypes.open_play")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setType("tournament")}
                                    className={getSegmentButtonClass(
                                        type === "tournament",
                                        getEventTypeSelectionClasses("tournament", mode)
                                    )}
                                >
                                    {t("eventTypes.tournament")}
                                </button>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                                {typeHelperText}
                            </p>
                        </div>

                        <div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                    {t("eventForm.covers.title")}
                                </h4>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {t("eventForm.covers.body")}
                                </p>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {coverOptions.map((coverOption) => {
                                    const isSelected =
                                        imageUrl === coverOption.imageUrl;

                                    return (
                                        <button
                                            key={coverOption.id}
                                            type="button"
                                            onClick={() =>
                                                setImageUrl(coverOption.imageUrl)
                                            }
                                            aria-label={t(coverOption.titleKey)}
                                            className={`group relative overflow-hidden rounded-3xl border bg-white text-left transition ${
                                                isSelected
                                                    ? "border-blue-500 shadow-[0_16px_36px_rgba(37,99,235,0.18)] ring-2 ring-blue-200"
                                                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                                            }`}
                                        >
                                            <div
                                                className="h-48 bg-cover bg-center transition duration-300 group-hover:scale-[1.02]"
                                                style={{
                                                    backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.06) 0%, rgba(15,23,42,0.18) 100%), url('${coverOption.imageUrl}')`,
                                                }}
                                            >
                                                <div
                                                    className={`absolute inset-0 transition ${
                                                        isSelected
                                                            ? "bg-blue-950/10"
                                                            : "bg-slate-950/0 group-hover:bg-slate-950/5"
                                                    }`}
                                                />

                                                {isSelected ? (
                                                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/60 via-slate-950/15 to-transparent p-4">
                                                        <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
                                                            {t(
                                                                "eventForm.covers.selected"
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                    {t("eventForm.visibility")}
                                </label>

                                <div className="mt-2 grid grid-cols-2 rounded-2xl bg-white p-1">
                                    <button
                                        type="button"
                                        onClick={() => setVisibility("public")}
                                        className={getSegmentButtonClass(
                                            visibility === "public",
                                            "bg-blue-600 text-white"
                                        )}
                                    >
                                        {t("eventVisibility.public")}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setVisibility("private")}
                                        className={getSegmentButtonClass(
                                            visibility === "private",
                                            "bg-slate-900 text-white"
                                        )}
                                    >
                                        {t("eventVisibility.private")}
                                    </button>
                                </div>
                            </div>

                            {type === "match" ? (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                        {t("eventForm.mode")}
                                    </label>

                                    <div className="mt-2 grid grid-cols-2 rounded-2xl bg-white p-1">
                                        <button
                                            type="button"
                                            onClick={() => setMode("casual")}
                                            className={getSegmentButtonClass(
                                                mode === "casual",
                                                "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                            )}
                                        >
                                            {t("eventModes.casual")}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMode("competitive")}
                                            className={getSegmentButtonClass(
                                                mode === "competitive",
                                                "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                                            )}
                                        >
                                            {t("eventModes.competitive")}
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {type === "tournament" ? (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                                {t("eventForm.tournament.registrationType")}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsRegistrationHelpOpen(true)}
                                                aria-label={t("eventForm.tournament.registrationHelpOpen")}
                                                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-700"
                                            >
                                                <Info size={12} />
                                            </button>
                                        </div>

                                        <div className="mt-2 grid grid-cols-2 rounded-2xl bg-white p-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTournamentRegistrationType("team")
                                                }
                                                className={getSegmentButtonClass(
                                                    tournamentRegistrationType === "team",
                                                    "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200"
                                                )}
                                            >
                                                {t("eventForm.tournament.registrationOptions.team")}
                                            </button>

                                    <button
                                                type="button"
                                                onClick={() =>
                                                    setTournamentRegistrationType("individual")
                                                }
                                                className={getSegmentButtonClass(
                                                    tournamentRegistrationType === "individual",
                                                    "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                                                )}
                                            >
                                                {t("eventForm.tournament.registrationOptions.individual")}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                            {t("eventForm.tournament.teamFormat")}
                                        </label>

                                        <div className="mt-2 grid grid-cols-2 rounded-2xl bg-white p-1">
                                            <button
                                                type="button"
                                                onClick={() => setTournamentTeamFormat("2v2")}
                                                className={getSegmentButtonClass(
                                                    tournamentTeamFormat === "2v2",
                                                    "bg-blue-600 text-white"
                                                )}
                                            >
                                                2x2
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setTournamentTeamFormat("4v4")}
                                                className={getSegmentButtonClass(
                                                    tournamentTeamFormat === "4v4",
                                                    "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                                )}
                                            >
                                                4x4
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                        {t("eventForm.tournament.entryFeeType")}
                                    </label>

                                    <div className="mt-2 grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                                        <div className="grid grid-cols-2 rounded-2xl bg-white p-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTournamentEntryFeeType("free")
                                                }
                                                className={getSegmentButtonClass(
                                                    tournamentEntryFeeType === "free",
                                                    "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                                )}
                                            >
                                                {t(
                                                    "eventForm.tournament.entryFeeOptions.free"
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTournamentEntryFeeType("paid")
                                                }
                                                className={getSegmentButtonClass(
                                                    tournamentEntryFeeType === "paid",
                                                    "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                                )}
                                            >
                                                {t(
                                                    "eventForm.tournament.entryFeeOptions.paid"
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 focus-within:ring-blue-500">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={
                                                    tournamentEntryFeeType === "paid"
                                                        ? tournamentEntryFeeAmount
                                                        : ""
                                                }
                                                onChange={(event) =>
                                                    setTournamentEntryFeeAmount(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    tournamentEntryFeeType !== "paid"
                                                }
                                                placeholder="10,00"
                                                className="w-full border-0 bg-transparent px-4 py-3 text-slate-900 outline-none disabled:text-slate-400"
                                            />
                                            <span className="flex items-center border-l border-slate-200 px-4 text-sm font-bold text-slate-500">
                                                EUR
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                            {t("eventForm.tournament.bracketType")}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsBracketHelpOpen(true)}
                                            aria-label={t("eventForm.tournament.bracketHelpOpen")}
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-yellow-700 shadow-sm ring-1 ring-yellow-200 transition hover:bg-yellow-100"
                                        >
                                            <HelpCircle size={16} />
                                        </button>
                                    </div>

                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                        {bracketCards.map((bracketCard) => (
                                            <button
                                                key={bracketCard.value}
                                                type="button"
                                                onClick={() =>
                                                    setTournamentBracketType(
                                                        bracketCard.value
                                                    )
                                                }
                                                className={`rounded-2xl border p-4 text-left transition ${getBracketCardClass(
                                                    bracketCard.value,
                                                    tournamentBracketType ===
                                                        bracketCard.value
                                                )}`}
                                            >
                                                <p className="text-sm font-bold text-slate-900">
                                                    {bracketCard.title}
                                                </p>
                                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                                    {bracketCard.body}
                                                </p>
                                                <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black leading-4 text-slate-700">
                                                    {t("eventForm.tournament.bracketRecommended", {
                                                        recommendation: bracketCard.recommendation,
                                                    })}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                            {t("eventForm.tournament.maxTeams")}
                                        </label>
                                        <input
                                            type="number"
                                            min={4}
                                            value={tournamentMaxTeams}
                                            onChange={(event) =>
                                                setTournamentMaxTeams(
                                                    Number(event.target.value)
                                                )
                                            }
                                            className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-blue-500"
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            {t("eventForm.tournament.maxTeamsBody", {
                                                players: tournamentParticipantCapacity,
                                                teamSize: tournamentTeamSize,
                                            })}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                            {t("eventForm.tournament.courtCount")}
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={tournamentCourtCount}
                                            onChange={(event) =>
                                                setTournamentCourtCount(
                                                    Number(event.target.value)
                                                )
                                            }
                                            className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-blue-500"
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            {t("eventForm.tournament.courtCountBody")}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                            {t("eventForm.tournament.matchDuration")}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                            {t("eventForm.tournament.matchDurationValue")}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                            {t("eventForm.tournament.finalsDuration")}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                            {t("eventForm.tournament.finalsDurationValue")}
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </section>

                    <FormSectionCard
                        title={t("eventForm.schedulingTitle")}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                    {t("eventForm.date")}
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)}
                                    className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                    {t("eventForm.time")}
                                </label>
                                <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200 focus-within:ring-blue-500">
                                    <select
                                        value={timeParts.hours}
                                        onChange={(event) =>
                                            handleHourChange(event.target.value)
                                        }
                                        className="rounded-xl border-0 bg-slate-100 px-3 py-2 text-slate-900 outline-none"
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

                                    <span className="text-sm font-bold text-slate-500">
                                        :
                                    </span>

                                    <select
                                        value={timeParts.minutes}
                                        onChange={(event) =>
                                            handleMinuteChange(event.target.value)
                                        }
                                        className="rounded-xl border-0 bg-slate-100 px-3 py-2 text-slate-900 outline-none"
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
                    </FormSectionCard>

                    <FormSectionCard
                        title={t("eventForm.capacityTitle")}
                    >
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                {type === "match"
                                    ? t("eventForm.maxParticipants")
                                    : type === "tournament"
                                      ? t("eventForm.tournament.participantCapacity")
                                      : t("eventForm.participantLimit")}
                            </label>

                            {type === "match" ? (
                                <>
                                    <input
                                        type="number"
                                        value={4}
                                        readOnly
                                        className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-500 outline-none ring-1 ring-slate-200"
                                    />

                                    <p className="mt-2 text-xs text-slate-500">
                                        {t("eventForm.matchesLocked")}
                                    </p>
                                </>
                            ) : type === "tournament" ? (
                                <>
                                    <input
                                        type="number"
                                        value={tournamentParticipantCapacity}
                                        readOnly
                                        className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-500 outline-none ring-1 ring-slate-200"
                                    />

                                    <p className="mt-2 text-xs text-slate-500">
                                        {t(
                                            tournamentRegistrationType === "individual"
                                                ? "eventForm.tournament.capacityIndividualBody"
                                                : "eventForm.tournament.capacityTeamBody",
                                            {
                                                count: tournamentParticipantCapacity,
                                                teams: tournamentMaxTeams,
                                                teamSize: tournamentTeamSize,
                                            }
                                        )}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <label className="mt-3 inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={unlimitedParticipants}
                                            onChange={(event) =>
                                                setUnlimitedParticipants(
                                                    event.target.checked
                                                )
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        {t("eventForm.unlimitedSpots")}
                                    </label>

                                    <input
                                        type="number"
                                        value={
                                            unlimitedParticipants ? "" : maxParticipants
                                        }
                                        onChange={(event) =>
                                            setMaxParticipants(
                                                Number(event.target.value)
                                            )
                                        }
                                        className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-blue-500 disabled:text-slate-400"
                                        min={1}
                                        disabled={unlimitedParticipants}
                                        placeholder={t(
                                            "eventForm.participantPlaceholder"
                                        )}
                                    />

                                    <p className="mt-2 text-xs text-slate-500">
                                        {unlimitedParticipants
                                            ? t("eventForm.unlimitedBody")
                                            : t("eventForm.limitedBody")}
                                    </p>
                                </>
                            )}
                        </div>
                    </FormSectionCard>

                    <FormSectionCard
                        title={t("eventForm.locationSectionTitle")}
                        body={t("eventForm.locationSectionBody")}
                    >
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                    {t("eventForm.searchLocation")}
                                </label>

                                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                                    <input
                                        placeholder={t(
                                            "eventForm.searchLocationPlaceholder"
                                        )}
                                        value={locationSearch}
                                        onChange={(event) =>
                                            setLocationSearch(event.target.value)
                                        }
                                        className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-blue-500"
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
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-900">
                                        {t("eventForm.locationName")}
                                    </label>
                                    <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                                        {t("eventForm.locationNameAutoFilled")}
                                    </span>
                                </div>

                                <div className="mt-2 flex cursor-not-allowed items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                                    <MapPin size={18} className="text-slate-400" />
                                    <input
                                        placeholder={t(
                                            "eventForm.locationNamePlaceholder"
                                        )}
                                        value={locationName}
                                        className="w-full cursor-not-allowed bg-transparent text-slate-500 outline-none placeholder:text-slate-400"
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

                                <div className="mt-2 h-64 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
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
                        </div>
                    </FormSectionCard>

                    <div
                        className={`grid gap-3 pt-2 ${
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
