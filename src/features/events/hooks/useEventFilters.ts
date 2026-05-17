import { useMemo, useState } from "react";
import type { Event, EventMode, EventType } from "../types/event.types";

export type EventTypeFilter = "all" | EventType;
export type EventModeFilter = "all" | EventMode;

export interface EventFiltersState {
    search: string;
    type: EventTypeFilter;
    mode: EventModeFilter;
    location: string;
    date: string;
}

const initialFilters: EventFiltersState = {
    search: "",
    type: "all",
    mode: "all",
    location: "all",
    date: "",
};

export function useEventFilters(events: Event[]) {
    const [filters, setFilters] = useState<EventFiltersState>(initialFilters);

    function updateFilter<K extends keyof EventFiltersState>(
        key: K,
        value: EventFiltersState[K]
    ) {
        setFilters((prev) => ({
        ...prev,
        [key]: value,
        }));
    }

    function clearFilters() {
        setFilters(initialFilters);
    }

    const locations = useMemo(() => {
        return Array.from(
        new Set(events.map((event) => event.locationName).filter(Boolean))
        ).sort();
    }, [events]);

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
        const searchValue = filters.search.toLowerCase().trim();

        const matchesSearch =
            !searchValue ||
            event.title.toLowerCase().includes(searchValue) ||
            event.locationName.toLowerCase().includes(searchValue);

        const matchesType =
            filters.type === "all" || event.type === filters.type;

        const matchesMode =
            filters.mode === "all" || event.mode === filters.mode;

        const matchesLocation =
            filters.location === "all" || event.locationName === filters.location;

        const matchesDate =
            !filters.date || event.startDate.slice(0, 10) === filters.date;

        return (
            matchesSearch &&
            matchesType &&
            matchesMode &&
            matchesLocation &&
            matchesDate
        );
        });
    }, [events, filters]);

    return {
        filters,
        locations,
        filteredEvents,
        updateFilter,
        clearFilters,
    };
}
