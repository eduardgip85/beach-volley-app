import { useEffect, useState } from "react";
import { getEventsByIds } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { getUserRegisteredEventIds } from "../../registrations/services/registrations.service";

export function useProfileEvents(userId?: string) {
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [pastEvents, setPastEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadRegisteredEvents() {
        if (!userId) return;

        try {
            setLoading(true);
            setError("");

            const eventIds = await getUserRegisteredEventIds(userId);
            const events = await getEventsByIds(eventIds);

            const now = new Date();

            const upcoming = events.filter(
            (event) => new Date(event.startDate) >= now
            );

            const past = events.filter(
            (event) => new Date(event.startDate) < now
            );

            setUpcomingEvents(upcoming);
            setPastEvents(past);
        } catch (err) {
            console.error(err);
            setError("Could not load registered events");
        } finally {
            setLoading(false);
        }
        }

        loadRegisteredEvents();
    }, [userId]);

    return {
        upcomingEvents,
        pastEvents,
        loading,
        error,
    };
}