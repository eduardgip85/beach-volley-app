import type { Event } from "../../events/types/event.types";
import { useTranslation } from "react-i18next";
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
    return (
        <>
        <section className="md:hidden">
            <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">
                {selectedDate.toLocaleString(i18n.language, {
                weekday: "short",
                month: "short",
                day: "numeric",
                })}
            </h2>

            <span className="text-sm font-bold uppercase text-slate-400">
                {t("calendar.eventsCount", { count: selectedDayEvents.length })}
            </span>
            </div>

            <div className="space-y-4">
            {selectedDayEvents.length === 0 ? (
                <EmptyCalendarMessage message={t("calendar.noEventsThisDay")} />
            ) : (
                selectedDayEvents.map((event) => (
                <CalendarEventCard key={event.id} event={event} compact />
                ))
            )}
            </div>
        </section>

        <section className="hidden md:block">
            <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950">
                {t("calendar.eventsThisMonth")}
            </h2>

            <span className="text-sm font-bold uppercase text-slate-400">
                {t("calendar.eventsCount", { count: monthEvents.length })}
            </span>
            </div>

            <div className="grid gap-4">
            {monthEvents.length === 0 ? (
                <EmptyCalendarMessage message={t("calendar.noEventsThisMonth")} />
            ) : (
                monthEvents.map((event) => (
                <CalendarEventCard key={event.id} event={event} />
                ))
            )}
            </div>
        </section>
        </>
    );
}

function EmptyCalendarMessage({ message }: { message: string }) {
    return (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="font-bold text-slate-900">{message}</p>
        </div>
    );
}
