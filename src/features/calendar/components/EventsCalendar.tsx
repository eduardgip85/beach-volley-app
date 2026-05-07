import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Event } from "../../events/types/event.types";

interface EventsCalendarProps {
  events: Event[];
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(dateA: Date, dateB: Date) {
  return dateA.toDateString() === dateB.toDateString();
}

function isSameMonth(dateA: Date, dateB: Date) {
  return (
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear()
  );
}

function isPastEvent(event: Event) {
  return new Date(event.startDate) < new Date();
}

function getMonthDays(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  const days: Date[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, previousMonthDays - i));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  while (days.length < 42) {
    const nextDay = days.length - (startDay + daysInMonth) + 1;
    days.push(new Date(year, month + 1, nextDay));
  }

  return days;
}

export function EventsCalendar({ events }: EventsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthDays = useMemo(() => getMonthDays(currentMonth), [currentMonth]);

  const monthEvents = useMemo(() => {
    return events.filter((event) =>
      isSameMonth(new Date(event.startDate), currentMonth)
    );
  }, [events, currentMonth]);

  const selectedDayEvents = useMemo(() => {
    return events.filter((event) =>
      isSameDay(new Date(event.startDate), selectedDate)
    );
  }, [events, selectedDate]);

  function goToPreviousMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }

  function handleSelectDay(day: Date) {
    setSelectedDate(day);

    if (!isSameMonth(day, currentMonth)) {
      setCurrentMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  }

  return (
    <section className=" space-y-4 md:space-y-3">
      <div className="flex items-center gap-4 bg-white p-4 max-w-fit rounded-xl">
        <h1 className="text-2xl font-black text-slate-950 md:text-3xl">
          {currentMonth.toLocaleString("en", {
            month: "long",
            year: "numeric",
          })}
        </h1>

        <div className="flex rounded-2xl bg-blue-100 p-1 gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-sm md:p-6">
        <div className="grid grid-cols-7 border py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-950">
          {weekDays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthDays.map((day) => {
            const dayEvents = events.filter((event) =>
              isSameDay(new Date(event.startDate), day)
            );

            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`min-h-16 border p-2 text-left transition last:border-r-0 md:min-h-28 ${
                  isCurrentMonth ? "text-slate-900" : "text-slate-300"
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

                {/* Mobile dots */}
                <div className="mt-2 flex justify-center gap-1 md:hidden">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className={`h-1.5 w-1.5 rounded-full ${
                        isPastEvent(event)
                          ? "bg-red-500"
                          : event.type === "match"
                            ? "bg-emerald-500"
                            : "bg-blue-600"
                      }`}
                    />
                  ))}
                </div>

                {/* Desktop event pills */}
                <div className="mt-2 hidden space-y-1 md:block">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`truncate rounded-full px-2 py-1 text-[11px] font-bold text-white 
                      ${isPastEvent(event)
                        ? "bg-red-500"
                        : event.type === "match"
                          ? "bg-emerald-500"
                          : "bg-blue-600"
                      }
                      ${event.type === "match"
                          ? "bg-emerald-500"
                          : "bg-blue-600"
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile selected day events */}
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
            <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
              <p className="font-bold text-slate-900">No events this day</p>
            </div>
          ) : (
            selectedDayEvents.map((event) => (
              <CalendarEventCard key={event.id} event={event} compact />
            ))
          )}
        </div>
      </section>

      {/* Desktop month events */}
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
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="font-bold text-slate-900">No events this month</p>
            </div>
          ) : (
            monthEvents.map((event) => (
              <CalendarEventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </section>
    </section>
  );
}

function CalendarEventCard({
  event,
  compact = false,
}: {
  event: Event;
  compact?: boolean;
}) {
  const isPast = new Date(event.startDate) < new Date();
  
  return (
    <Link
      to={`/events/${event.id}`}
      className={`block rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex gap-4">
        <div
          className={`flex items-center justify-center rounded-2xl ${
            event.type === "match"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-blue-50 text-blue-600"
          } ${compact ? "h-14 w-14" : "h-16 w-16"}`}
        >
          <TrophyIcon type={event.type} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <h3 className="truncate font-black text-slate-950">
              {event.title}
            </h3>

            <span className="text-sm font-bold text-slate-400">
              {new Date(event.startDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="mt-2 flex flex-col gap-1 text-sm text-slate-500 md:flex-row md:gap-6">
            <span className="inline-flex items-center gap-2">
              <MapPin size={15} />
              {event.locationName}
            </span>

            <span
              className={`inline-flex items-center gap-2 capitalize rounded-full px-3 py-1 text-xs font-bold uppercase ${
                isPast
                  ? "bg-red-100 text-red-700"
                  : event.type === "match"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              <Trophy size={15} />
              {isPast ? "Finished" : event.type}
            </span>

            <span className="inline-flex items-center gap-2 capitalize">
              <CalendarDays size={15}/>
              {new Date(event.startDate).toLocaleDateString([], {
                day: "numeric",
                month: "short",
              })}
            </span>

          </div>
        </div>
      </div>
    </Link>
  );
}

function TrophyIcon({ type }: { type: Event["type"] }) {
  return (
    <span className="text-xl font-black">
      {type === "match" ? "🏐" : "🏆"}
    </span>
  );
}