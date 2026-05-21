import { CalendarDays, MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getEventModeLabel } from "../../events/utils/event-display.utils";
import {
    formatCompetitiveRating,
    formatCompetitiveRatingDelta,
} from "../../ratings/utils/rating-display.utils";
import type { CompetitiveHistoryMatch } from "../types/profileCompetitiveInsights.types";

interface CompetitiveMatchHistoryCardProps {
    match: CompetitiveHistoryMatch;
}

export function CompetitiveMatchHistoryCard({
    match,
}: CompetitiveMatchHistoryCardProps) {
    const { t, i18n } = useTranslation();
    const isWin = match.outcome === "win";
    const deltaLabel = formatCompetitiveRatingDelta(match.ratingDelta);
    const modeLabel = getEventModeLabel(match.mode);

    return (
        <Link
            to={`/events/${match.eventId}`}
            className={`block rounded-[1.75rem] border p-4 transition sm:rounded-3xl sm:p-5 ${
                isWin
                    ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70"
                    : "border-red-200 bg-red-50 hover:bg-red-100/70"
            }`}
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                isWin
                                    ? "bg-emerald-600 text-white"
                                    : "bg-red-600 text-white"
                            }`}
                        >
                            {isWin ? t("profile.won") : t("profile.lost")}
                        </span>

                        {modeLabel ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                {modeLabel}
                            </span>
                        ) : null}

                        {deltaLabel ? (
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                    (match.ratingDelta ?? 0) >= 0
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-slate-900 text-white"
                                }`}
                            >
                                {(match.ratingDelta ?? 0) >= 0 ? (
                                    <TrendingUp size={14} />
                                ) : (
                                    <TrendingDown size={14} />
                                )}
                                {deltaLabel}
                            </span>
                        ) : (
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                                {t("profile.legacyResult")}
                            </span>
                        )}
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-900 sm:text-lg">
                        {match.title}
                    </h3>

                    <div className="mt-3 space-y-2 text-sm text-slate-500">
                        <p className="flex items-center gap-2">
                            <CalendarDays size={16} />
                            {new Date(match.startDate).toLocaleString(i18n.language)}
                        </p>

                        <p className="flex items-center gap-2">
                            <MapPin size={16} />
                            {match.locationName}
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px] xl:min-w-[360px] xl:max-w-[420px]">
                    <div className="rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            {t("profile.ratingAfterMatch")}
                        </p>
                        {match.rating != null ? (
                            <>
                                <p className="mt-2 text-2xl font-black text-slate-900">
                                    {formatCompetitiveRating(match.rating)}
                                </p>
                                {deltaLabel ? (
                                    <p
                                        className={`mt-1 text-sm font-bold ${
                                            (match.ratingDelta ?? 0) >= 0
                                                ? "text-emerald-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {deltaLabel}
                                    </p>
                                ) : null}
                            </>
                        ) : (
                            <p className="mt-2 text-sm font-semibold text-slate-500">
                                {t("profile.olderMatchNoDelta")}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200">
                        {match.sets.map((set) => (
                            <div
                                key={`${match.historyId}-${set.setNumber}`}
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
            </div>
        </Link>
    );
}
