import type { Event } from "../../events/types/event.types";
import { weekDays } from "../utils/calendar.utils";
import { CalendarDayCell } from "./CalendarDayCell";

interface CalendarGridProps {
    events: Event[];
    monthDays: Date[];
    currentMonth: Date;
    selectedDate: Date;
    onSelectDay: (day: Date) => void;
}

export function CalendarGrid({
    events,
    monthDays,
    currentMonth,
    selectedDate,
    onSelectDay,
}: CalendarGridProps) {
    return (
        <div className="overflow-hidden rounded-3xl bg-white p-3 shadow-sm md:p-6">
            <div className="grid grid-cols-7 border py-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
                {weekDays.map((day) => (
                <div key={day}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {monthDays.map((day) => (
                <CalendarDayCell
                    key={day.toISOString()}
                    day={day}
                    events={events}
                    currentMonth={currentMonth}
                    selectedDate={selectedDate}
                    onSelectDay={onSelectDay}
                />
                ))}
            </div>
        </div>
    );
}
