import { CalendarDays, ShieldCheck, Swords } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PublicProfileRecentMatch } from "../types/publicProfile.types";
import { getEventModeLabel } from "../../events/utils/event-display.utils";

interface PublicRecentMatchesSectionProps {
    matches: PublicProfileRecentMatch[];
}

export function PublicRecentMatchesSection({
    matches,
}: PublicRecentMatchesSectionProps) {
    const { t, i18n } = useTranslation();

    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {t("profile.lastFiveMatches")}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("publicProfile.recentMatchesSummaryBody")}
                    </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                    {t("publicProfile.summaryOnly")}
                </span>
            </div>

            {matches.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">
                        {t("publicProfile.noRecentMatches")}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("publicProfile.noRecentMatchesBody")}
                    </p>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {matches.map((match) => {
                        const isWin = match.outcome === "win";
                        const modeLabel = getEventModeLabel(match.mode);

                        return (
                            <div
                                key={`${match.eventId}-${match.startDate}`}
                                className={`rounded-3xl border p-5 ${
                                    isWin
                                        ? "border-emerald-200 bg-emerald-50"
                                        : "border-red-200 bg-red-50"
                                }`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700">
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
                                            {match.title}
                                        </h3>

                                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                                            <p className="flex items-center gap-2">
                                                <CalendarDays size={16} />
                                                {new Date(match.startDate).toLocaleString(i18n.language)}
                                            </p>

                                            <p className="flex items-center gap-2">
                                                <Swords size={16} />
                                                {match.playerTeam === "team_a"
                                                    ? t("publicProfile.playedInTeamA")
                                                    : t("publicProfile.playedInTeamB")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="min-w-[180px] space-y-2 rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200">
                                        {match.sets.map((set) => (
                                            <div
                                                key={`${match.eventId}-set-${set.setNumber}`}
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
                        );
                    })}
                </div>
            )}
        </div>
    );
}
