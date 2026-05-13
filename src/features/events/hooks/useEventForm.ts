import { useState, type FormEvent } from "react";
import { searchLocation } from "../services/geocoding.service";
import type { CreateEventPayload, Event, EventType } from "../types/event.types";

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

export function useEventForm({ initialEvent, onSubmit }: UseEventFormOptions) {
    const [title, setTitle] = useState(initialEvent?.title ?? "");
    const [description, setDescription] = useState(initialEvent?.description ?? "");
    const [type, setType] = useState<EventType>(initialEvent?.type ?? "match");

    const [date, setDate] = useState(
        initialEvent ? getDateValue(initialEvent.startDate) : ""
    );

    const [time, setTime] = useState(
        initialEvent ? getTimeValue(initialEvent.startDate) : ""
    );

    const [maxParticipants, setMaxParticipants] = useState(
        initialEvent?.maxParticipants ?? 8
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

        if (!date || !time) {
        setError("Date and time are required");
        return;
        }

        try {
        setSubmitting(true);
        setError("");

        const startDate = new Date(`${date}T${time}`).toISOString();

        await onSubmit({
            title,
            description,
            type,
            locationName,
            latitude,
            longitude,
            startDate,
            maxParticipants: Number(maxParticipants),
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
        setType,
        setDate,
        setTime,
        setMaxParticipants,
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