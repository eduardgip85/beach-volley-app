import { useState, type FormEvent, type SetStateAction } from "react";
import i18n from "../../../i18n";
import {
    reverseGeocodeLocation,
    searchLocation,
} from "../services/geocoding.service";
import {
    getDefaultEventCoverForType,
} from "../constants/eventCoverOptions";
import { UNLIMITED_EVENT_CAPACITY, isUnlimitedEventCapacity } from "../types/event.types";
import type {
    CreateEventPayload,
    Event,
    EventMode,
    EventType,
    EventVisibility,
    TournamentBracketType,
    TournamentEntryFeeType,
    TournamentRegistrationType,
    TournamentTeamFormat,
} from "../types/event.types";

interface UseEventFormOptions {
    initialEvent?: Event;
    initialType?: EventType;
    onSubmit: (payload: CreateEventPayload) => Promise<void>;
}

function getDateValue(date: string) {
    return new Date(date).toISOString().slice(0, 10);
}

function getTimeValue(date: string) {
    return new Date(date).toTimeString().slice(0, 5);
}

function getInitialType(initialEvent?: Event, initialType?: EventType): EventType {
    return initialEvent?.type ?? initialType ?? "match";
}

function getInitialVisibility(initialEvent?: Event): EventVisibility {
    return initialEvent?.visibility ?? "public";
}

function getInitialMode(initialEvent?: Event, initialType?: EventType): EventMode | null {
    const type = getInitialType(initialEvent, initialType);

    if (type === "match") {
        return initialEvent?.mode ?? "casual";
    }

    return null;
}

function getInitialMaxParticipants(initialEvent?: Event, initialType?: EventType) {
    const type = getInitialType(initialEvent, initialType);

    if (type === "match") {
        return 4;
    }

    if (type === "tournament") {
        return initialEvent?.tournamentSettings?.maxTeams ?? 8;
    }

    return initialEvent?.maxParticipants ?? 8;
}

function getInitialUnlimitedParticipants(initialEvent?: Event, initialType?: EventType) {
    const type = getInitialType(initialEvent, initialType);

    if (type === "match") {
        return false;
    }

    return isUnlimitedEventCapacity(initialEvent?.maxParticipants ?? 8);
}

function getInitialTournamentRegistrationType(
    initialEvent?: Event
): TournamentRegistrationType {
    return initialEvent?.tournamentSettings?.registrationType ?? "team";
}

function getInitialTournamentTeamFormat(
    initialEvent?: Event
): TournamentTeamFormat {
    return initialEvent?.tournamentSettings?.teamFormat ?? "2v2";
}

function getInitialTournamentBracketType(
    initialEvent?: Event
): TournamentBracketType {
    return initialEvent?.tournamentSettings?.bracketType ?? "single_elimination";
}

function getInitialTournamentEntryFeeType(
    initialEvent?: Event
): TournamentEntryFeeType {
    return initialEvent?.tournamentSettings?.entryFeeType ?? "free";
}

function getInitialTournamentEntryFeeAmount(initialEvent?: Event) {
    return initialEvent?.tournamentSettings?.entryFeeAmount?.toString() ?? "10";
}

function parseTournamentEntryFeeAmount(value: string) {
    const normalizedValue = value.trim().replace(",", ".");

    if (!normalizedValue) {
        return null;
    }

    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getInitialTournamentMaxTeams(initialEvent?: Event) {
    return initialEvent?.tournamentSettings?.maxTeams ?? 8;
}

function getInitialTournamentCourtCount(initialEvent?: Event) {
    return initialEvent?.tournamentSettings?.courtCount ?? 1;
}

function getInitialImageUrl(initialEvent?: Event, initialType?: EventType) {
    if (initialEvent?.imageUrl) {
        return initialEvent.imageUrl;
    }

    return getDefaultEventCoverForType(getInitialType(initialEvent, initialType));
}

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        return error.message;
    }

    return fallback;
}

export function useEventForm({ initialEvent, initialType, onSubmit }: UseEventFormOptions) {
    const [title, setTitle] = useState(initialEvent?.title ?? "");
    const [description, setDescription] = useState(initialEvent?.description ?? "");
    const [type, setTypeState] = useState<EventType>(
        getInitialType(initialEvent, initialType)
    );
    const [visibility, setVisibility] = useState<EventVisibility>(
        getInitialVisibility(initialEvent)
    );
    const [mode, setModeState] = useState<EventMode | null>(
        getInitialMode(initialEvent, initialType)
    );
    const [tournamentRegistrationType, setTournamentRegistrationType] =
        useState<TournamentRegistrationType>(
            getInitialTournamentRegistrationType(initialEvent)
        );
    const [tournamentTeamFormat, setTournamentTeamFormat] =
        useState<TournamentTeamFormat>(getInitialTournamentTeamFormat(initialEvent));
    const [tournamentBracketType, setTournamentBracketType] =
        useState<TournamentBracketType>(
            getInitialTournamentBracketType(initialEvent)
        );
    const [tournamentEntryFeeType, setTournamentEntryFeeType] =
        useState<TournamentEntryFeeType>(
            getInitialTournamentEntryFeeType(initialEvent)
        );
    const [tournamentEntryFeeAmount, setTournamentEntryFeeAmount] = useState(
        getInitialTournamentEntryFeeAmount(initialEvent)
    );
    const [tournamentMaxTeams, setTournamentMaxTeams] = useState(
        getInitialTournamentMaxTeams(initialEvent)
    );
    const [tournamentCourtCount, setTournamentCourtCount] = useState(
        getInitialTournamentCourtCount(initialEvent)
    );

    const [date, setDate] = useState(
        initialEvent ? getDateValue(initialEvent.startDate) : ""
    );

    const [time, setTime] = useState(
        initialEvent ? getTimeValue(initialEvent.startDate) : ""
    );

    const [maxParticipants, setMaxParticipantsState] = useState(
        getInitialMaxParticipants(initialEvent, initialType)
    );
    const [unlimitedParticipants, setUnlimitedParticipants] = useState(
        getInitialUnlimitedParticipants(initialEvent, initialType)
    );

    const [locationName, setLocationName] = useState(
        initialEvent?.locationName ?? ""
    );

    const [latitude, setLatitude] = useState(initialEvent?.latitude ?? 41.3851);
    const [longitude, setLongitude] = useState(initialEvent?.longitude ?? 2.1734);

    const [locationSearch, setLocationSearch] = useState("");
    const [searchingLocation, setSearchingLocation] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(
        getInitialImageUrl(initialEvent, initialType)
    );

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function setType(nextType: SetStateAction<EventType>) {
        const resolvedType =
            typeof nextType === "function" ? nextType(type) : nextType;

        setTypeState(resolvedType);
        setImageUrl(getDefaultEventCoverForType(resolvedType));

        if (resolvedType === "match") {
            setUnlimitedParticipants(false);
            setMaxParticipantsState(4);
            setModeState((currentMode) => currentMode ?? "casual");
            return;
        }

        if (resolvedType === "tournament") {
            setUnlimitedParticipants(false);
            setModeState(null);
            return;
        }

        setModeState(null);
    }

    async function handleSearchLocation() {
        if (!locationSearch.trim()) {
        setError(i18n.t("eventForm.errors.writeLocation"));
        return;
        }

        try {
        setSearchingLocation(true);
        setError("");

        const result = await searchLocation(locationSearch);

        if (!result) {
            setError(i18n.t("eventForm.errors.locationNotFound"));
            return;
        }

        setLatitude(result.latitude);
        setLongitude(result.longitude);
        setLocationName(result.displayName);
        } catch (err) {
        console.error(err);
        setError(i18n.t("eventForm.errors.searchFailed"));
        } finally {
        setSearchingLocation(false);
        }
    }

    async function handleMapLocationChange(coords: {
        latitude: number;
        longitude: number;
    }) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);

        try {
            const result = await reverseGeocodeLocation(
                coords.latitude,
                coords.longitude
            );

            if (result?.displayName) {
                setLocationName(result.displayName);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedLocationName = locationName.trim();
        const resolvedMode = type === "match" ? mode : null;
        const resolvedMaxParticipants =
            type === "match"
                ? 4
                : unlimitedParticipants
                  ? UNLIMITED_EVENT_CAPACITY
                  : Number(maxParticipants);

        if (!trimmedTitle || !date || !time || !trimmedLocationName) {
        setError(i18n.t("eventForm.errors.requiredFields"));
        return;
        }

        if (type === "match" && !resolvedMode) {
        setError(i18n.t("eventForm.errors.modeRequired"));
        return;
        }

        if (visibility !== "public" && visibility !== "private") {
        setError(i18n.t("eventForm.errors.visibilityRequired"));
        return;
        }

        if (
            type === "open_play" &&
            !unlimitedParticipants &&
            (!Number.isFinite(resolvedMaxParticipants) || resolvedMaxParticipants < 1)
        ) {
        setError(i18n.t("eventForm.errors.maxParticipantsMin"));
        return;
        }

        if (type === "tournament") {
            const parsedTournamentEntryFeeAmount = parseTournamentEntryFeeAmount(
                tournamentEntryFeeAmount
            );

            if (!Number.isFinite(tournamentMaxTeams) || tournamentMaxTeams < 4) {
                setError(i18n.t("eventForm.errors.tournamentMinTeams"));
                return;
            }

            if (!Number.isFinite(tournamentCourtCount) || tournamentCourtCount < 1) {
                setError(i18n.t("eventForm.errors.tournamentMinCourts"));
                return;
            }

            if (
                tournamentEntryFeeType === "paid" &&
                (parsedTournamentEntryFeeAmount === null ||
                    parsedTournamentEntryFeeAmount <= 0)
            ) {
                setError(i18n.t("eventForm.errors.tournamentInvalidEntryFee"));
                return;
            }
        }

        try {
        setSubmitting(true);
        setError("");

        const startDate = new Date(`${date}T${time}`).toISOString();
        const parsedTournamentEntryFeeAmount = parseTournamentEntryFeeAmount(
            tournamentEntryFeeAmount
        );

        await onSubmit({
            title: trimmedTitle,
            description,
            type,
            visibility,
            mode: resolvedMode,
            locationName: trimmedLocationName,
            latitude,
            longitude,
            startDate,
            maxParticipants: resolvedMaxParticipants,
            imageUrl,
            tournamentSettings:
                type === "tournament"
                    ? {
                          registrationType: tournamentRegistrationType,
                          teamFormat: tournamentTeamFormat,
                          entryFeeType: tournamentEntryFeeType,
                          entryFeeAmount:
                              tournamentEntryFeeType === "paid"
                                  ? parsedTournamentEntryFeeAmount
                                  : null,
                          entryFeeCurrency: "EUR",
                          bracketType: tournamentBracketType,
                          state: initialEvent?.tournamentSettings?.state ?? "draft",
                          maxTeams: Math.max(4, Math.trunc(tournamentMaxTeams)),
                          courtCount: Math.max(1, Math.trunc(tournamentCourtCount)),
                          matchDurationMinutes: 25,
                          finalsDurationMinutes: 40,
                      }
                    : null,
        });
        } catch (err) {
        console.error(err);
        setError(getErrorMessage(err, i18n.t("eventForm.errors.saveFailed")));
        } finally {
        setSubmitting(false);
        }
    }

    return {
        values: {
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
        },

        setters: {
        setTitle,
        setDescription,
        setType,
        setVisibility,
        setMode: setModeState,
        setDate,
        setTime,
        setMaxParticipants: setMaxParticipantsState,
        setUnlimitedParticipants,
        setTournamentRegistrationType,
        setTournamentTeamFormat,
        setTournamentEntryFeeType,
        setTournamentEntryFeeAmount,
        setTournamentBracketType,
        setTournamentMaxTeams,
        setTournamentCourtCount,
        setLocationName,
        setLatitude,
        setLongitude,
        setLocationSearch,
        setImageUrl,
        },

        state: {
        error,
        submitting,
        searchingLocation,
        },

        actions: {
        handleSubmit,
        handleSearchLocation,
        handleMapLocationChange,
        setError,
        },
    };
}
