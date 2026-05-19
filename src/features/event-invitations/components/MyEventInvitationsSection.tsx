import { CalendarDays, MapPin, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { EventInvitation } from "../types/eventInvitation.types";

interface MyEventInvitationsSectionProps {
    invitations: EventInvitation[];
    loading: boolean;
    error: string;
}

export function MyEventInvitationsSection({
    invitations,
    loading,
    error,
}: MyEventInvitationsSectionProps) {
    const { t, i18n } = useTranslation();

    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Mail size={22} />
                </span>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {t("eventInvitations.title")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {t("eventInvitations.body")}
                    </p>
                </div>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-slate-500">{t("eventInvitations.loading")}</p>
            ) : null}

            {error ? (
                <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            ) : null}

            {!loading && !error && invitations.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">{t("eventInvitations.emptyTitle")}</p>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("eventInvitations.emptyBody")}
                    </p>
                </div>
            ) : null}

            {!loading && !error && invitations.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {invitations.map((invitation) => (
                        <Link
                            key={invitation.id}
                            to={`/events/${invitation.eventId}`}
                            className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:bg-blue-50"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                                {t("eventInvitations.invitedBy", {
                                    name: invitation.inviter.fullName,
                                })}
                            </p>

                            <h3 className="mt-3 text-lg font-bold text-slate-900">
                                {invitation.event.title}
                            </h3>

                            <div className="mt-4 space-y-2 text-sm text-slate-500">
                                <p className="flex items-center gap-2">
                                    <CalendarDays size={16} />
                                    {new Date(invitation.event.startDate).toLocaleString(i18n.language)}
                                </p>
                                <p className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    {invitation.event.locationName}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
