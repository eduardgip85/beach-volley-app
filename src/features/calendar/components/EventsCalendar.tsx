import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import type { Event } from "../../events/types/event.types";

interface EventsCalendarProps {
    events: Event[];
}

export function EventsCalendar({ events }: EventsCalendarProps) {
    const navigate = useNavigate();

    const calendarEvents = events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.startDate,
        end: event.endDate ?? undefined,
        backgroundColor: event.type === "match" ? "#10b981" : "#2563eb",
        borderColor: event.type === "match" ? "#10b981" : "#2563eb",
        extendedProps: {
        type: event.type,
        locationName: event.locationName,
        },
    }));

    return (
        <div className="rounded-3xl bg-white p-4 shadow-sm">
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            height="auto"
            headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            eventMouseLeave={() => {
            const tooltip = document.querySelector(".absolute.z-10.rounded.bg-slate-700.px-2.py-1.text-xs.text-white");
            if (tooltip) {
                document.body.removeChild(tooltip);
            }
            }}

            eventClick={(info) => {
            navigate(`/events/${info.event.id}`);
            }}
            eventClassNames={() => ["cursor-pointer"]}
        />
        </div>
    );
}