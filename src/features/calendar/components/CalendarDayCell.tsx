import type { Event } from "../../events/types/event.types";
import {
    getEventColorClasses,
    isSameDay,
    isSameMonth,
} from "../utils/calendar.utils";

interface CalendarDayCellProps {
    day: Date;
    events: Event[];
    currentMonth: Date;
    selectedDate: Date;
    onSelectDay: (day: Date) => void;
}

export function CalendarDayCell({
    day,
    events,
    currentMonth,
    selectedDate,
    onSelectDay,
}: CalendarDayCellProps) {
    const dayEvents = events.filter((event) =>
        isSameDay(new Date(event.startDate), day)
    );

    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isSelected = isSameDay(day, selectedDate);
    const isToday = isSameDay(day, new Date());

    return (
        <button
        type="button"
        onClick={() => onSelectDay(day)}
        className={`min-h-16 border p-2 text-left transition last:border-r-0 md:min-h-28 ${
            isCurrentMonth ? "text-slate-900" : "text-slate-400"
        } ${isSelected ? "bg-blue-50 ring-2 ring-blue-200" : ""}`}
        >
        <div className="flex items-center justify-between">
            <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold ${
                isToday
                ? "bg-blue-600 text-white"
                : isSelected
                    ? "text-blue-700"
                    : ""
            }`}
            >
            {day.getDate()}
            </span>
        </div>

        <div className="mt-2 flex justify-center gap-1 md:hidden">
            {dayEvents.slice(0, 3).map((event) => (
            <span
                key={event.id}
                className={`h-1.5 w-1.5 rounded-full ${getEventColorClasses(
                event
                )}`}
            />
            ))}
        </div>

        <div className="mt-2 hidden space-y-1 md:block">
            {dayEvents.slice(0, 2).map((event) => (
            <div
                key={event.id}
                className={`truncate rounded-full px-2 py-1 text-[11px] font-bold text-white ${getEventColorClasses(
                event
                )}`}
            >
                {event.title}
            </div>
            ))}
        </div>
        </button>
    );
}