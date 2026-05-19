import { CalendarDays, Lock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { EventJoinRequest } from "../types/eventJoinRequest.types";

interface MyEventJoinRequestsSectionProps {
    requests: EventJoinRequest[];
    loading: boolean;
    error: string;
}

function getStatusClasses(status: EventJoinRequest["status"]) {
    switch (status) {
        case "accepted":
            return "bg-emerald-100 text-emerald-700";
        case "rejected":
            return "bg-red-100 text-red-700";
        case "cancelled":
            return "bg-slate-200 text-slate-700";
        default:
            return "bg-amber-100 text-amber-700";
    }
}

function getStatusLabel(
    status: EventJoinRequest["status"],
    t: (key: string) => string
) {
    switch (status) {
        case "accepted":
            return t("myEventJoinRequests.status.accepted");
        case "rejected":
            return t("myEventJoinRequests.status.rejected");
        case "cancelled":
            return t("myEventJoinRequests.status.cancelled");
        default:
            return t("myEventJoinRequests.status.pending");
    }
}

export function MyEventJoinRequestsSection({
    requests,
    loading,
    error,
}: MyEventJoinRequestsSectionProps) {
    const { t, i18n } = useTranslation();

    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Lock size={22} />
                </span>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {t("myEventJoinRequests.title")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {t("myEventJoinRequests.body")}
                    </p>
                </div>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-slate-500">
                    {t("myEventJoinRequests.loading")}
                </p>
            ) : null}

            {error ? (
                <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            ) : null}

            {!loading && !error && requests.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">
                        {t("myEventJoinRequests.emptyTitle")}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("myEventJoinRequests.emptyBody")}
                    </p>
                </div>
            ) : null}

            {!loading && !error && requests.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {requests.map((request) => (
                        <Link
                            key={request.id}
                            to={`/events/${request.eventId}`}
                            className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:bg-blue-50"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusClasses(
                                        request.status
                                    )}`}
                                >
                                    {getStatusLabel(request.status, t)}
                                </span>
                                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase text-white">
                                    {t("eventVisibility.private")}
                                </span>
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-slate-900">
                                {request.event.title}
                            </h3>

                            <div className="mt-4 space-y-2 text-sm text-slate-500">
                                <p className="flex items-center gap-2">
                                    <CalendarDays size={16} />
                                    {new Date(request.event.startDate).toLocaleString(i18n.language)}
                                </p>

                                <p className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    {request.event.locationName}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
