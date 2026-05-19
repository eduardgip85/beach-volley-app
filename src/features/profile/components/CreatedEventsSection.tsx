import { CalendarDays, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Event } from "../../events/types/event.types";
import {
    getEventBadgeClasses,
    getEventDisplayStatus,
    getEventModeLabel,
    getEventTypeLabel,
    getEventVisibilityBadgeClasses,
    getEventVisibilityLabel,
} from "../../events/utils/event-display.utils";

interface CreatedEventsSectionProps {
    events: Event[];
    loading: boolean;
    error: string;
}

export function CreatedEventsSection({
    events,
    loading,
    error,
}: CreatedEventsSectionProps) {
    const { t, i18n } = useTranslation();

    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {t("createdEvents.title")}
                        </h2>
                        {!loading && !error ? (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700">
                                {t("createdEvents.createdCount", { count: events.length })}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("createdEvents.body")}
                    </p>
                </div>

                <Link
                    to="/events/create"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                >
                    {t("createdEvents.createNew")}
                </Link>
            </div>

            {loading ? (
                <p className="text-sm text-slate-500">{t("createdEvents.loading")}</p>
            ) : null}

            {error ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            ) : null}

            {!loading && !error && events.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">{t("createdEvents.emptyTitle")}</p>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("createdEvents.emptyBody")}
                    </p>
                </div>
            ) : null}

            {!loading && !error && events.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                    {events.map((event) => {
                        const modeLabel =
                            event.type === "match" ? getEventModeLabel(event.mode) : null;

                        return (
                            <Link
                                key={event.id}
                                to={`/events/${event.id}`}
                                className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:bg-blue-50"
                            >
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                                            event
                                        )}`}
                                    >
                                        {getEventTypeLabel(event.type)}
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventVisibilityBadgeClasses(
                                            event.visibility
                                        )}`}
                                    >
                                        {getEventVisibilityLabel(event.visibility)}
                                    </span>

                                    {modeLabel ? (
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                            {modeLabel}
                                        </span>
                                    ) : null}
                                </div>

                                <h3 className="mt-4 font-bold text-slate-900">{event.title}</h3>

                                <div className="mt-3 space-y-2 text-sm text-slate-500">
                                    <p className="flex items-center gap-2">
                                        <CalendarDays size={16} />
                                        {new Date(event.startDate).toLocaleString(i18n.language)}
                                    </p>

                                    <p className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        {event.locationName}
                                    </p>
                                </div>

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    {getEventDisplayStatus(event)}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
