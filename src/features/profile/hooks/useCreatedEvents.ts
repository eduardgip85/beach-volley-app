import { useEffect, useState } from "react";
import { getEventsCreatedByUser } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { isPastEvent } from "../../events/utils/event-display.utils";

export function useCreatedEvents(userId?: string) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCreatedEvents() {
            if (!userId) {
                setEvents([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getEventsCreatedByUser(userId);
                setEvents(
                    data.filter(
                    (event) => event.status === "active" && !isPastEvent(event)
                    )
                );
            } catch (err) {
                console.error(err);
                setError("Could not load your created events");
            } finally {
                setLoading(false);
            }
        }

        loadCreatedEvents();
    }, [userId]);

    return {
        events,
        loading,
        error,
    };
}
