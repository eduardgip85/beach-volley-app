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
    goToToday,
    handleSelectDay,
  } = useEventsCalendar(events);

  return (
    <section className="space-y-4">
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(21rem,0.8fr)]">
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
      </div>
    </section>
  );
}
