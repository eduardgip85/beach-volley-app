import { useEffect, useState } from "react";
import { getEvents } from "../services/events.service";
import type { Event } from "../types/event.types";

export function useEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadEvents() {
        try {
            setLoading(true);
            setError("");

            const data = await getEvents();
            setEvents(data);
        } catch (err) {
            console.error(err);
            setError("Could not load events");
        } finally {
            setLoading(false);
        }
        }

        loadEvents();
    }, []);

    return {
        events,
        loading,
        error,
    };
}