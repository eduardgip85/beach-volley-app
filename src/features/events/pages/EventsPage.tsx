import { CalendarDays, Map, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CountrySetupNotice } from "../../../shared/components/CountrySetupNotice";
import { EventFilters } from "../../../shared/components/EventFilters";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { useAuth } from "../../auth/context/AuthContext";
import { EventDiscoveryCard } from "../components/EventDiscoveryCard";
import { useCountryScopedEvents } from "../hooks/useCountryScopedEvents";
import { useEventFilters } from "../hooks/useEventFilters";
import { useEventsPage } from "../hooks/useEventsPage";
import type { Event } from "../types/event.types";

type QuickFilter = "all" | "today" | "week" | "casual" | "competitive" | "tournament";

function isSameDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString();
}

function getDaysFromToday(date: Date) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((dateStart.getTime() - todayStart.getTime()) / 86_400_000);
}

export function EventsPage() {
  const { t } = useTranslation();
  const { events, loading, error } = useEventsPage();
  const { profile } = useAuth();
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  usePageSeo({
    title: buildSeoTitle(t("eventsPage.title")),
    description: t("eventsPage.seoDescription"),
    canonicalPath: "/events",
  });

  const hasCountryContext = Boolean(profile?.country?.trim());
  const { countryScopedEvents, countryScopedLoading } = useCountryScopedEvents(
    events,
    profile?.country
  );
  const { filteredEvents, filters, locations, updateFilter, clearFilters } =
    useEventFilters(countryScopedEvents);
  const isPageLoading = loading || countryScopedLoading;

  const quickFilteredEvents = useMemo(() => {
    const today = new Date();

    return filteredEvents
      .filter((event) => {
        const eventDate = new Date(event.startDate);

        switch (quickFilter) {
          case "today":
            return isSameDay(eventDate, today);
          case "week":
            return getDaysFromToday(eventDate) >= 0 && getDaysFromToday(eventDate) <= 7;
          case "casual":
            return event.type === "match" && event.mode === "casual";
          case "competitive":
            return event.type === "match" && event.mode === "competitive";
          case "tournament":
            return event.type === "tournament";
          default:
            return true;
        }
      })
      .sort((left, right) => left.startDate.localeCompare(right.startDate));
  }, [filteredEvents, quickFilter]);

  const groupedEvents = useMemo(() => {
    const groups: Array<{ key: string; title: string; events: Event[] }> = [
      { key: "today", title: t("eventsPage.groups.today"), events: [] },
      { key: "soon", title: t("eventsPage.groups.soon"), events: [] },
      { key: "later", title: t("eventsPage.groups.later"), events: [] },
    ];

    quickFilteredEvents.forEach((event) => {
      const days = getDaysFromToday(new Date(event.startDate));
      const group = days === 0 ? groups[0] : days <= 7 ? groups[1] : groups[2];
      group.events.push(event);
    });

    return groups.filter((group) => group.events.length > 0);
  }, [quickFilteredEvents, t]);

  const quickFilters: QuickFilter[] = [
    "all",
    "today",
    "week",
    "casual",
    "competitive",
    "tournament",
  ];

  function clearAllFilters() {
    clearFilters();
    setQuickFilter("all");
  }

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              <Sparkles size={14} />
              {t("eventsPage.eyebrow")}
            </div>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              {t("eventsPage.heroTitle")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              {t("eventsPage.heroBody")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/map"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15"
            >
              <Map size={17} />
              {t("eventsPage.openMap")}
            </Link>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15"
            >
              <CalendarDays size={17} />
              {t("eventsPage.openCalendar")}
            </Link>
            <Link
              to="/events/create"
              className="hidden items-center gap-2 rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-yellow-200 md:inline-flex"
            >
              <Plus size={17} />
              {t("eventsPage.createEvent")}
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setQuickFilter(filter)}
              className={`rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] transition ${
                quickFilter === filter
                  ? "bg-white text-slate-950"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              {t(`eventsPage.quickFilters.${filter}`)}
            </button>
          ))}
        </div>
      </div>

      <Link
        to="/events/create"
        aria-label={t("eventsPage.createEvent")}
        className="fixed bottom-28 right-4 z-[1500] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700 active:scale-95 md:hidden"
      >
        <Plus size={24} />
      </Link>

      <EventFilters
        filters={filters}
        locations={locations}
        showLocationFilter={hasCountryContext}
        onFilterChange={updateFilter}
        onClearFilters={clearAllFilters}
      />

      <CountrySetupNotice visible={Boolean(profile && !profile.country?.trim())} />

      {isPageLoading ? (
        <p className="rounded-[1.75rem] bg-white p-6 text-sm text-slate-500 shadow-sm">
          {t("eventsPage.loading")}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : null}

      {!isPageLoading && !error && quickFilteredEvents.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <CalendarDays className="mx-auto text-slate-300" size={38} />
          <p className="mt-4 text-lg font-black text-slate-950">{t("eventsPage.emptyTitle")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("eventsPage.emptyBody")}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700"
            >
              {t("eventsPage.clearFilters")}
            </button>
            <Link
              to="/events/create"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              {t("eventsPage.createEvent")}
            </Link>
          </div>
        </div>
      ) : null}

      {!isPageLoading && !error
        ? groupedEvents.map((group) => (
            <section key={group.key}>
              <SectionHeading
                eyebrow={t("eventsPage.upcomingEyebrow")}
                title={group.title}
                count={group.events.length}
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.events.map((event) => (
                  <EventDiscoveryCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))
        : null}
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
      </div>
      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 shadow-sm">
        {count}
      </span>
    </div>
  );
}
