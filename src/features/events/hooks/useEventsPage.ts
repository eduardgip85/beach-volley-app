import { useEffect, useState } from "react";
import i18n from "../../../i18n";
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
            setError(i18n.t("eventsPage.loadError"));
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
