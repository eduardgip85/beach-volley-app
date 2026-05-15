import { useEffect, useState } from "react";
import { getPublicEvents } from "../services/events.service";
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
            
            const data = await getPublicEvents();

            const upcoming = data.filter(
            (event) => new Date(event.startDate) >= new Date()
            );

            setEvents(upcoming);
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
