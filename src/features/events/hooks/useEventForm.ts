import { useEffect, useState, type FormEvent } from "react";
import { searchLocation } from "../services/geocoding.service";
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
    }, [type, mode, maxParticipants]);

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

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedLocationName = locationName.trim();
        const resolvedMode = type === "match" ? mode : null;
        const resolvedMaxParticipants =
            type === "match" ? 4 : Number(maxParticipants);

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
        setError("Could not save event");
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
        setError,
        },
    };
}
