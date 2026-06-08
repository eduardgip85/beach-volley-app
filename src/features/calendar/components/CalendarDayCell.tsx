import type { Event } from "../../events/types/event.types";
import { useTranslation } from "react-i18next";
import {
    getEventColorClasses,
    isFinishedEvent,
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
    const { t } = useTranslation();
    const dayEvents = events.filter((event) =>
        isSameDay(new Date(event.startDate), day)
    );
    const finishedDayEvents = dayEvents.filter((event) => isFinishedEvent(event));
    const activeDayEvents = dayEvents.filter((event) => !isFinishedEvent(event));
    const visibleMobileActiveEvents = activeDayEvents.slice(0, 3);
    const visibleDesktopEvents = activeDayEvents.slice(0, 2);
    const remainingActiveEvents = Math.max(activeDayEvents.length - visibleDesktopEvents.length, 0);
    const remainingMobileEvents = Math.max(dayEvents.length - visibleMobileActiveEvents.length, 0);

    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isSelected = isSameDay(day, selectedDate);
    const isToday = isSameDay(day, new Date());
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

    return (
        <button
            type="button"
            onClick={() => onSelectDay(day)}
        className={`relative min-h-[4.75rem] border border-slate-100 p-1.5 text-left transition-all md:min-h-28 md:p-2.5 ${
                isCurrentMonth
                    ? isWeekend
                        ? "bg-amber-50/35 text-slate-900 hover:bg-amber-50/70"
                        : "bg-white text-slate-900 hover:bg-slate-50"
                    : "bg-slate-50/80 text-slate-300 hover:bg-slate-100/80"
            } ${
                isSelected
                    ? "z-10 bg-blue-50 shadow-[inset_0_0_0_2px_rgba(37,99,235,0.45)]"
                    : ""
            }`}
        >
        <div className="flex items-center justify-between">
            <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold transition ${
                isToday
                ? "bg-blue-600 text-white shadow-sm"
                : isSelected
                    ? "bg-blue-100 text-blue-700"
                    : ""
            }`}
            >
            {day.getDate()}
            </span>
        </div>

        <div className="mt-2 min-h-[14px] md:hidden">
            {visibleMobileActiveEvents.length > 0 || finishedDayEvents.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {visibleMobileActiveEvents.map((event) => (
                        <span
                            key={event.id}
                            className={`h-1.5 w-1.5 rounded-full shadow-sm ${getEventColorClasses(
                                event
                            )}`}
                        />
                    ))}

                    {finishedDayEvents.length > 0 ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    ) : null}
                </div>
            ) : null}

            {remainingMobileEvents > 0 ? (
                <div className="mt-1 text-center">
                    <span className="inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                    {t("calendar.moreEventsCompact", { count: remainingMobileEvents })}
                    </span>
                </div>
            ) : null}
        </div>

        <div className="mt-2 hidden space-y-1 md:block">
            {finishedDayEvents.length > 0 ? (
                <div className="truncate rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-400">
                    {t("calendar.finishedEventsCount", {
                        count: finishedDayEvents.length,
                    })}
                </div>
            ) : null}

            {visibleDesktopEvents.map((event) => (
                <div
                    key={event.id}
                    className={`truncate rounded-full px-2 py-1 text-[11px] font-bold text-white ${getEventColorClasses(
                        event
                    )}`}
                >
                    {event.title}
                </div>
            ))}

            {remainingActiveEvents > 0 ? (
                <div className="truncate rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                    {t("calendar.moreEvents", { count: remainingActiveEvents })}
                </div>
            ) : null}
        </div>
        </button>
    );
}
