import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getEventBadgeClasses, getEventModeLabel } from "../../events/utils/event-display.utils";
import type { ProfileRecentMatch } from "../types/profileStats.types";

interface ProfileMatchHistoryCardsProps {
    matches: ProfileRecentMatch[];
}

export function ProfileMatchHistoryCards({
    matches,
}: ProfileMatchHistoryCardsProps) {
    const { t, i18n } = useTranslation();

    return (
        <div className="space-y-4">
            {matches.map(({ event, result, outcome }) => {
                const modeLabel = getEventModeLabel(event.mode);
                const isWin = outcome === "win";

                return (
                    <Link
                        key={result.id}
                        to={`/events/${event.id}`}
                        className={`block rounded-3xl border p-5 transition ${
                            isWin
                                ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70"
                                : "border-red-200 bg-red-50 hover:bg-red-100/70"
                        }`}
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                                            event
                                        )}`}
                                    >
                                        {t("eventTypes.match")}
                                    </span>

                                    {modeLabel ? (
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                            {modeLabel}
                                        </span>
                                    ) : null}

                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                                        <ShieldCheck size={14} />
                                        {t("profile.validated")}
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                            isWin
                                                ? "bg-emerald-600 text-white"
                                                : "bg-red-600 text-white"
                                        }`}
                                    >
                                        {isWin ? t("profile.won") : t("profile.lost")}
                                    </span>
                                </div>

                                <h3 className="mt-4 text-lg font-bold text-slate-900">
                                    {event.title}
                                </h3>

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
                            </div>

                            <div className="min-w-[180px] space-y-2 rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200">
                                {result.sets.map((set) => (
                                    <div
                                        key={set.id}
                                        className="flex items-center justify-between text-sm text-slate-700"
                                    >
                                        <span className="font-semibold text-slate-500">
                                            {t("profile.setLabel", {
                                                number: set.setNumber,
                                            })}
                                        </span>
                                        <span className="font-black text-slate-900">
                                            {set.teamAScore} - {set.teamBScore}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
