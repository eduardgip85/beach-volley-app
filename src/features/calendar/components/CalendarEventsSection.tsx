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
    return (
        <>
        <section className="md:hidden">
            <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">
                {selectedDate.toLocaleString("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
                })}
            </h2>

            <span className="text-sm font-bold uppercase text-slate-400">
                {selectedDayEvents.length} events
            </span>
            </div>

            <div className="space-y-4">
            {selectedDayEvents.length === 0 ? (
                <EmptyCalendarMessage message="No active events this day" />
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
                Events this month
            </h2>

            <span className="text-sm font-bold uppercase text-slate-400">
                {monthEvents.length} events
            </span>
            </div>

            <div className="grid gap-4">
            {monthEvents.length === 0 ? (
                <EmptyCalendarMessage message="No active events this month" />
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
