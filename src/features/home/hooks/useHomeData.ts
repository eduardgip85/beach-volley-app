import { useEffect, useState } from "react";
import { getEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { getEventRegistrationsCount } from "../../registrations/services/registrations.service";

export function useHomeData() {
    const [events, setEvents] = useState<Event[]>([]);
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadHomeData() {
        try {
            setLoading(true);
            setError("");

            const data = await getEvents();
            setEvents(data);

            const counts = await Promise.all(
            data.map((event) => getEventRegistrationsCount(event.id))
            );

            setTotalParticipants(counts.reduce((total, count) => total + count, 0));
        } catch (err) {
            console.error(err);
            setError("Could not load home data");
        } finally {
            setLoading(false);
        }
        }

        loadHomeData();
    }, []);

    const activeMatches = events.filter(
        (event) => event.status === "active" && event.type === "match"
    ).length;

    const upcomingEvents = events
        .filter((event) => new Date(event.startDate) >= new Date())
        .slice(0, 3);

    return {
        events,
        loading,
        error,
        totalParticipants,
        totalEvents: events.length,
        activeMatches,
        upcomingEvents,
    };
}