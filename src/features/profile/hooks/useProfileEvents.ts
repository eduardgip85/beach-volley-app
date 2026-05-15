import { useEffect, useState } from "react";
import { getEventsByIds } from "../../events/services/events.service";
import { isPastEvent } from "../../events/utils/event-display.utils";
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

            const upcoming = events.filter(
                (event) =>
                    event.status === "active" &&
                    !isPastEvent(event)
            );

            upcoming.sort(
                (left, right) =>
                    new Date(left.startDate).getTime() -
                    new Date(right.startDate).getTime()
            );

            const limitedUpcoming = upcoming.slice(0, 3);
            const past = events.filter(
                (event) =>
                    event.status !== "active" ||
                    isPastEvent(event)
            );

            setUpcomingEvents(limitedUpcoming);
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
