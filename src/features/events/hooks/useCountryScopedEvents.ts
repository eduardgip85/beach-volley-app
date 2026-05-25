import { useEffect, useMemo, useState } from "react";
import type { Event } from "../types/event.types";
import { filterEventsByCountry } from "../services/eventCountry.service";

function haveSameEventIds(left: Event[], right: Event[]) {
    if (left.length !== right.length) {
        return false;
    }

    return left.every((event, index) => event.id === right[index]?.id);
}

export function useCountryScopedEvents(events: Event[], country: string | null | undefined) {
    const [countryScopedEvents, setCountryScopedEvents] = useState<Event[]>(events);
    const [loading, setLoading] = useState(false);
    const trimmedCountry = country?.trim() ?? "";
    const eventsSignature = useMemo(
        () =>
            events
                .map(
                    (event) =>
                        `${event.id}:${event.updatedAt}:${event.latitude}:${event.longitude}`
                )
                .join("|"),
        [events]
    );

    useEffect(() => {
        let isCancelled = false;

        async function scopeEventsToCountry() {
            if (!trimmedCountry) {
                setCountryScopedEvents((current) =>
                    haveSameEventIds(current, events) ? current : events
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const filteredEvents = await filterEventsByCountry(events, trimmedCountry);

                if (!isCancelled) {
                    setCountryScopedEvents((current) =>
                        haveSameEventIds(current, filteredEvents)
                            ? current
                            : filteredEvents
                    );
                }
            } catch (error) {
                console.error("Could not scope events by country", error);

                if (!isCancelled) {
                    setCountryScopedEvents((current) =>
                        haveSameEventIds(current, events) ? current : events
                    );
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        void scopeEventsToCountry();

        return () => {
            isCancelled = true;
        };
    }, [eventsSignature, trimmedCountry]);

    return {
        countryScopedEvents,
        countryScopedLoading: loading,
    };
}
