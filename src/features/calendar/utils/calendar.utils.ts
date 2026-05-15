import type { Event } from "../../events/types/event.types";
import {
    getEventBadgeClasses as getSharedEventBadgeClasses,
    getEventColorClasses as getSharedEventColorClasses,
    isPastEvent as isSharedPastEvent,
} from "../../events/utils/event-display.utils";

export const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isSameDay(dateA: Date, dateB: Date) {
    return dateA.toDateString() === dateB.toDateString();
}

export function isSameMonth(dateA: Date, dateB: Date) {
    return (
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getFullYear() === dateB.getFullYear()
    );
}

export function isPastEvent(event: Event) {
    return isSharedPastEvent(event);
}

export function getMonthDays(currentDate: Date) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    const days: Date[] = [];

    for (let i = startDay - 1; i >= 0; i--) {
        days.push(new Date(year, month - 1, previousMonthDays - i));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
    }

    while (days.length < 42) {
        const nextDay = days.length - (startDay + daysInMonth) + 1;
        days.push(new Date(year, month + 1, nextDay));
    }

    return days;
}

export function getEventColorClasses(event: Event) {
    return getSharedEventColorClasses(event);
}

export function getEventBadgeClasses(event: Event) {
    return getSharedEventBadgeClasses(event);
}
