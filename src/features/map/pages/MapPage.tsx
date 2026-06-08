import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CountrySetupNotice } from "../../../shared/components/CountrySetupNotice";
import { EventFilters } from "../../../shared/components/EventFilters";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { useAuth } from "../../auth/context/AuthContext";
import { getCountryCenter } from "../../events/services/eventCountry.service";
import { getAccessibleEventsForUser } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { useEventFilters } from "../../events/hooks/useEventFilters";
import { isFinishedEvent, isPastEvent } from "../../events/utils/event-display.utils";
import { IdeasInlineCta } from "../../feature-requests/components/IdeasInlineCta";
import { EventsMap } from "../components/EventsMap";

export function MapPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [myEventIds, setMyEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [defaultCenter, setDefaultCenter] = useState<[number, number]>([20, 0]);
  const [defaultZoom, setDefaultZoom] = useState(2);
  const { profile } = useAuth();

  usePageSeo({
    title: buildSeoTitle(t("nav.map")),
    description: t("mapPage.seoDescription"),
    canonicalPath: "/map",
  });

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => !isFinishedEvent(event) && !isPastEvent(event)),
    [events]
  );

  const {
    filteredEvents,
    filters,
    locations,
    updateFilter,
    clearFilters,
  } = useEventFilters(visibleEvents, {
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
        setError(t("mapPage.loadError"));
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [profile?.id, t]);

  useEffect(() => {
    let isCancelled = false;

    async function loadCountryCenter() {
      if (!profile?.country?.trim()) {
        setDefaultCenter([20, 0]);
        setDefaultZoom(2);
        return;
      }

      try {
        const center = await getCountryCenter(profile.country);

        if (!isCancelled && center) {
          setDefaultCenter(center);
          setDefaultZoom(6);
        }
      } catch (centerError) {
        console.error("Could not load country center for map", centerError);
      }
    }

    void loadCountryCenter();

    return () => {
      isCancelled = true;
    };
  }, [profile?.country]);

  const isPageLoading = loading;

  return (
    <section>

      <EventFilters
        filters={filters}
        locations={locations}
        showMyEventsFilter={Boolean(profile)}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      <CountrySetupNotice visible={Boolean(profile && !profile.country?.trim())} />

      {isPageLoading && <p className="mt-8 text-slate-500">{t("mapPage.loading")}</p>}

      {error && (
        <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!isPageLoading && !error && (
        <div className="mt-6 h-[72vh] min-h-[480px] overflow-hidden rounded-[2rem] bg-white p-2 shadow-sm md:h-[calc(100dvh-220px)] md:min-h-[650px]">

          <EventsMap
            events={filteredEvents}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
          />
        </div>
      )}

      <div className="mt-6">
        <IdeasInlineCta context="map" tone="sand" />
      </div>
    </section>
  );
}
