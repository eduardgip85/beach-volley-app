import { CalendarCheck2, CalendarX2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Event } from "../../events/types/event.types";
import { CalendarEventCard } from "./CalendarEventCard";

interface CalendarEventsSectionProps {
    selectedDate: Date;
    selectedDayEvents: Event[];
    monthEvents: Event[];
}

export function CalendarEventsSection({
    selectedDate,
    selectedDayEvents,
    monthEvents,
}: CalendarEventsSectionProps) {
    const { t, i18n } = useTranslation();
    const sortedEvents = [...selectedDayEvents].sort((left, right) =>
        left.startDate.localeCompare(right.startDate)
    );
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    return (
        <aside className="min-w-0 xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <header className="bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_55%,_#fffbea_100%)] p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                                {isToday ? t("calendar.today") : t("calendar.selectedDay")}
                            </p>
                            <h2 className="mt-2 text-2xl font-black capitalize text-slate-950">
                                {selectedDate.toLocaleString(i18n.language, {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                })}
                            </h2>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white">
                            {t("calendar.eventsCount", { count: sortedEvents.length })}
                        </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        {t("calendar.monthActivity", { count: monthEvents.length })}
                    </p>
                </header>

                <div className="max-h-none space-y-3 bg-slate-100 p-3 pb-5 xl:max-h-[calc(100dvh-15rem)] xl:overflow-y-auto xl:overscroll-contain">
                    {sortedEvents.length === 0 ? (
                        <EmptyCalendarMessage />
                    ) : (
                        sortedEvents.map((event, index) => (
                            <div key={event.id} className="relative pl-5">
                                {index < sortedEvents.length - 1 ? (
                                    <span className="absolute bottom-[-0.75rem] left-[0.3rem] top-5 w-px bg-slate-300" />
                                ) : null}
                                <span className="absolute left-0 top-5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                                <p className="mb-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                                    {new Date(event.startDate).toLocaleTimeString(i18n.language, {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                    {index === 0 ? ` - ${t("calendar.nextOnDay")}` : ""}
                                </p>
                                <CalendarEventCard event={event} compact />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}

function EmptyCalendarMessage() {
    const { t } = useTranslation();

    return (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-7 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CalendarX2 size={22} />
            </span>
            <p className="mt-4 font-black text-slate-950">{t("calendar.noEventsThisDay")}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t("calendar.noEventsThisDayBody")}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                <CalendarCheck2 size={14} />
                {t("calendar.chooseAnotherDay")}
            </div>
        </div>
    );
}
