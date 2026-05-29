import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CountrySetupNotice } from "../../../shared/components/CountrySetupNotice";
import { EventFilters } from "../../../shared/components/EventFilters";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { useAuth } from "../../auth/context/AuthContext";
import { useCountryScopedEvents } from "../../events/hooks/useCountryScopedEvents";
import { getAccessibleEventsForUser } from "../../events/services/events.service";
import { useEventFilters } from "../../events/hooks/useEventFilters";
import type { Event } from "../../events/types/event.types";
import { isFinishedEvent } from "../../events/utils/event-display.utils";
import { EventsCalendar } from "../components/EventsCalendar";

export function CalendarPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [myEventIds, setMyEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { profile } = useAuth();

  usePageSeo({
    title: buildSeoTitle(t("nav.calendar")),
    description: t("calendar.seoDescription"),
    canonicalPath: "/calendar",
    noindex: true,
  });

  const hasCountryContext = Boolean(profile?.country?.trim());
  const { countryScopedEvents, countryScopedLoading } = useCountryScopedEvents(
    events,
    profile?.country
  );
  const { filteredEvents, filters, locations, updateFilter, clearFilters } =
    useEventFilters(countryScopedEvents, {
      isMyEvent: (event) => myEventIds.includes(event.id),
    });
  const calendarEvents =
    filters.myEventsOnly
      ? filteredEvents.filter((event) => !isFinishedEvent(event))
      : filteredEvents;

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

  const isPageLoading = loading || countryScopedLoading;

  return (
    <section className="space-y-4">
      <EventFilters
        filters={filters}
        locations={locations}
        showLocationFilter={hasCountryContext}
        showMyEventsFilter={Boolean(profile)}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      <CountrySetupNotice visible={Boolean(profile && !profile.country?.trim())} />

      {isPageLoading && <p className="text-slate-500">{t("calendar.loading")}</p>}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!isPageLoading && !error && <EventsCalendar events={calendarEvents} />}
    </section>
  );
}
