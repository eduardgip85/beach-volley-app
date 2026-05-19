import { Flame, Globe, TrendingUp, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import type { RankingPlayer } from "../types/ranking.types";

interface RankingPlayerCardProps {
    player: RankingPlayer;
    canOpenProfile?: boolean;
}

function getPositionClasses(position: number) {
    if (position === 1) {
        return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
    }

    if (position === 2) {
        return "bg-slate-200 text-slate-700 ring-1 ring-slate-300";
    }

    if (position === 3) {
        return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
    }

    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export function RankingPlayerCard({
    player,
    canOpenProfile = true,
}: RankingPlayerCardProps) {
    const { t } = useTranslation();

    const content = (
        <>
            <div className="flex items-start gap-3">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${getPositionClasses(
                        player.position
                    )}`}
                >
                    #{player.position}
                </div>

                {player.avatarUrl ? (
                    <img
                        src={player.avatarUrl}
                        alt={player.fullName}
                        className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                    />
                ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-base font-black text-white">
                        {player.fullName.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-black text-slate-900">
                            {player.fullName}
                        </h3>

                        {player.country ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                                <Globe size={12} />
                                {player.country}
                            </span>
                        ) : null}
                    </div>

                    {player.city ? (
                        <p className="mt-1 truncate text-xs font-medium text-slate-500">
                            {player.city}
                        </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            <Trophy size={13} />
                            {t("profile.ratingTooltip", {
                                rating: formatCompetitiveRating(player.competitiveRating),
                            })}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            <TrendingUp size={13} />
                            {t("profile.winRate")}: {player.winRate}%
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                            <Flame size={13} />
                            {t("profile.currentStreak")} {player.currentStreak}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        {t("profile.matchesPlayed")}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                        {player.matchesPlayed}
                    </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        W / L
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                        {player.wins}/{player.losses}
                    </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        {t("profile.bestStreak")}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                        {player.bestStreak}
                    </p>
                </div>
            </div>
        </>
    );

    const className = canOpenProfile
        ? "block rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
        : "block rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

    if (!canOpenProfile) {
        return (
            <div className={className} aria-disabled="true">
                {content}
            </div>
        );
    }

    return (
        <Link to={`/players/${player.profileId}`} className={className}>
            {content}
        </Link>
    );
}
