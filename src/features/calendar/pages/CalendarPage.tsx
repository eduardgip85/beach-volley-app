import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EventFilters } from "../../../shared/components/EventFilters";
import { useAuth } from "../../auth/context/AuthContext";
import { getAccessibleEventsForUser } from "../../events/services/events.service";
import { useEventFilters } from "../../events/hooks/useEventFilters";
import type { Event } from "../../events/types/event.types";
import { EventsCalendar } from "../components/EventsCalendar";

export function CalendarPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [myEventIds, setMyEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { profile } = useAuth();
  const { filteredEvents, filters, locations, updateFilter, clearFilters } =
    useEventFilters(events, {
      isMyEvent: (event) => myEventIds.includes(event.id),
    });

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const result = await getAccessibleEventsForUser(profile?.id);
        setEvents(result.events);
        setMyEventIds(result.myEventIds);
      } catch (err) {
        console.error(err);
        setError(t("calendar.loadError"));
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [profile?.id]);

  return (
    <section className="space-y-4">
      <EventFilters
        filters={filters}
        locations={locations}
        showMyEventsFilter={Boolean(profile)}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      {loading && <p className="text-slate-500">{t("calendar.loading")}</p>}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && <EventsCalendar events={filteredEvents} />}
    </section>
  );
}
