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
        t("calendar.weekDayMon"),
        t("calendar.weekDayTue"),
        t("calendar.weekDayWed"),
        t("calendar.weekDayThu"),
        t("calendar.weekDayFri"),
        t("calendar.weekDaySat"),
        t("calendar.weekDaySun"),
    ];

    return (
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-2 shadow-sm sm:p-3 md:p-5">
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

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 px-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 sm:text-xs">
                <LegendDot className="bg-emerald-500" label={t("calendar.legendCasual")} />
                <LegendDot className="bg-violet-600" label={t("calendar.legendCompetitive")} />
                <LegendDot className="bg-orange-500" label={t("calendar.legendOpenPlay")} />
                <LegendDot className="bg-yellow-500" label={t("calendar.legendTournament")} />
            </div>
        </div>
    );
}

function LegendDot({ className, label }: { className: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
            {label}
        </span>
    );
}
