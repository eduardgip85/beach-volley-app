import { useMemo, useState } from "react";
import type { Event } from "../../events/types/event.types";
import { getMonthDays, isSameDay, isSameMonth } from "../utils/calendar.utils";

export function useEventsCalendar(events: Event[]) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthDays = useMemo(() => {
        return getMonthDays(currentMonth);
    }, [currentMonth]);

    const monthEvents = useMemo(() => {
        return events.filter((event) =>
        isSameMonth(new Date(event.startDate), currentMonth)
        );
    }, [events, currentMonth]);

    const selectedDayEvents = useMemo(() => {
        return events.filter((event) =>
        isSameDay(new Date(event.startDate), selectedDate)
        );
    }, [events, selectedDate]);

    function goToPreviousMonth() {
        setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    }

    function goToNextMonth() {
        setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    }

    function handleSelectDay(day: Date) {
        setSelectedDate(day);

        if (!isSameMonth(day, currentMonth)) {
        setCurrentMonth(new Date(day.getFullYear(), day.getMonth(), 1));
        }
    }

    return {
        currentMonth,
        selectedDate,
        monthDays,
        monthEvents,
        selectedDayEvents,
        goToPreviousMonth,
        goToNextMonth,
        handleSelectDay,
    };
}