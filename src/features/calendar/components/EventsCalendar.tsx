import type { Event } from "../../events/types/event.types";
import { CalendarEventsSection } from "./CalendarEventsSection";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { useEventsCalendar } from "../hooks/useEventsCalendar";

interface EventsCalendarProps {
  events: Event[];
}

export function EventsCalendar({ events }: EventsCalendarProps) {
  const {
    currentMonth,
    selectedDate,
    monthDays,
    monthEvents,
    selectedDayEvents,
    goToPreviousMonth,
    goToNextMonth,
    handleSelectDay,
  } = useEventsCalendar(events);

  return (
    <section className="space-y-8">
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <CalendarGrid
        events={events}
        monthDays={monthDays}
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onSelectDay={handleSelectDay}
      />

      <CalendarEventsSection
        selectedDate={selectedDate}
        selectedDayEvents={selectedDayEvents}
        monthEvents={monthEvents}
      />
    </section>
  );
}