import type { Event } from "../../events/types/event.types";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
    const weekDays = [
        t("calendar.weekDaySun"),
        t("calendar.weekDayMon"),
        t("calendar.weekDayTue"),
        t("calendar.weekDayWed"),
        t("calendar.weekDayThu"),
        t("calendar.weekDayFri"),
        t("calendar.weekDaySat"),
    ];

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-3 shadow-sm md:p-6">
            <div className="mb-2 grid grid-cols-7 rounded-2xl bg-slate-50 py-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
                {weekDays.map((day) => (
                <div key={day}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-slate-100 bg-white">
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
