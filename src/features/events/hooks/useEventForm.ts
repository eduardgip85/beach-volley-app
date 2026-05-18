import { useEffect, useState, type FormEvent } from "react";
import {
    reverseGeocodeLocation,
    searchLocation,
} from "../services/geocoding.service";
import { UNLIMITED_EVENT_CAPACITY, isUnlimitedEventCapacity } from "../types/event.types";
import type {
    CreateEventPayload,
    Event,
    EventMode,
    EventType,
    EventVisibility,
} from "../types/event.types";

interface UseEventFormOptions {
    initialEvent?: Event;
    onSubmit: (payload: CreateEventPayload) => Promise<void>;
}

function getDateValue(date: string) {
    return new Date(date).toISOString().slice(0, 10);
}

function getTimeValue(date: string) {
    return new Date(date).toTimeString().slice(0, 5);
}

function getInitialType(initialEvent?: Event): EventType {
    return initialEvent?.type ?? "match";
}

function getInitialVisibility(initialEvent?: Event): EventVisibility {
    return initialEvent?.visibility ?? "public";
}

function getInitialMode(initialEvent?: Event): EventMode | null {
    const type = getInitialType(initialEvent);

    if (type === "match") {
        return initialEvent?.mode ?? "casual";
    }

    return null;
}

function getInitialMaxParticipants(initialEvent?: Event) {
    const type = getInitialType(initialEvent);

    if (type === "match") {
        return 4;
    }

    return initialEvent?.maxParticipants ?? 8;
}

function getInitialUnlimitedParticipants(initialEvent?: Event) {
    const type = getInitialType(initialEvent);

    if (type === "match") {
        return false;
    }

    return isUnlimitedEventCapacity(initialEvent?.maxParticipants ?? 8);
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

export function useEventForm({ initialEvent, onSubmit }: UseEventFormOptions) {
    const [title, setTitle] = useState(initialEvent?.title ?? "");
    const [description, setDescription] = useState(initialEvent?.description ?? "");
    const [type, setTypeState] = useState<EventType>(getInitialType(initialEvent));
    const [visibility, setVisibility] = useState<EventVisibility>(
        getInitialVisibility(initialEvent)
    );
    const [mode, setModeState] = useState<EventMode | null>(
        getInitialMode(initialEvent)
    );

    const [date, setDate] = useState(
        initialEvent ? getDateValue(initialEvent.startDate) : ""
    );

    const [time, setTime] = useState(
        initialEvent ? getTimeValue(initialEvent.startDate) : ""
    );

    const [maxParticipants, setMaxParticipantsState] = useState(
        getInitialMaxParticipants(initialEvent)
    );
    const [unlimitedParticipants, setUnlimitedParticipants] = useState(
        getInitialUnlimitedParticipants(initialEvent)
    );

    const [locationName, setLocationName] = useState(
        initialEvent?.locationName ?? ""
    );

    const [latitude, setLatitude] = useState(initialEvent?.latitude ?? 41.3851);
    const [longitude, setLongitude] = useState(initialEvent?.longitude ?? 2.1734);

    const [locationSearch, setLocationSearch] = useState("");
    const [searchingLocation, setSearchingLocation] = useState(false);

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (type === "match") {
            if (unlimitedParticipants) {
                setUnlimitedParticipants(false);
            }

            if (maxParticipants !== 4) {
                setMaxParticipantsState(4);
            }

            if (!mode) {
                setModeState("casual");
            }

            return;
        }

        if (mode !== null) {
            setModeState(null);
        }
    }, [type, mode, maxParticipants, unlimitedParticipants]);

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
        setLocationName(result.displayName);
        } catch (err) {
        console.error(err);
        setError("Could not search location");
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
        setError("Title, date, time, and location are required");
        return;
        }

        if (type === "tournament") {
        setError("Tournament events are coming soon");
        return;
        }

        if (type === "match" && !resolvedMode) {
        setError("Mode is required for match events");
        return;
        }

        if (visibility !== "public" && visibility !== "private") {
        setError("Visibility is required");
        return;
        }

        if (
            type === "open_play" &&
            !unlimitedParticipants &&
            (!Number.isFinite(resolvedMaxParticipants) || resolvedMaxParticipants < 1)
        ) {
        setError("Max participants must be at least 1");
        return;
        }

        try {
        setSubmitting(true);
        setError("");

        const startDate = new Date(`${date}T${time}`).toISOString();

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
            imageUrl: initialEvent?.imageUrl ?? null,
        });
        } catch (err) {
        console.error(err);
        setError(getErrorMessage(err, "Could not save event"));
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
        locationName,
        latitude,
        longitude,
        locationSearch,
        },

        setters: {
        setTitle,
        setDescription,
        setType: setTypeState,
        setVisibility,
        setMode: setModeState,
        setDate,
        setTime,
        setMaxParticipants: setMaxParticipantsState,
        setUnlimitedParticipants,
        setLocationName,
        setLatitude,
        setLongitude,
        setLocationSearch,
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
