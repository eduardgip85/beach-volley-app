import { Activity, BarChart3, Flame, Gauge, Trophy, TrendingUp, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import type { CompetitiveProfileInsights } from "../types/profileCompetitiveInsights.types";
import type { MatchHistorySummary } from "../utils/profileMatchHistory.utils";

interface CompetitiveStatsOverviewProps {
    insights?: CompetitiveProfileInsights;
    summary?: MatchHistorySummary;
    variant?: "competitive" | "casual";
}

export function CompetitiveStatsOverview({
    insights,
    summary,
    variant = "competitive",
}: CompetitiveStatsOverviewProps) {
    const { t } = useTranslation();

    const baseSummary =
        variant === "competitive"
            ? {
                  matchesPlayed: insights?.matchesPlayed ?? 0,
                  wins: insights?.wins ?? 0,
                  losses: insights?.losses ?? 0,
                  winRate: insights?.winRate ?? 0,
                  currentStreak: insights?.currentStreak ?? 0,
                  bestStreak: insights?.bestStreak ?? 0,
              }
            : {
                  matchesPlayed: summary?.matchesPlayed ?? 0,
                  wins: summary?.wins ?? 0,
                  losses: summary?.losses ?? 0,
                  winRate: summary?.winRate ?? 0,
                  currentStreak: summary?.currentStreak ?? 0,
                  bestStreak: summary?.bestStreak ?? 0,
              };

    const ratingItems =
        variant === "competitive"
            ? [
                  {
                      key: "currentRating",
                      label: t("profile.currentRating"),
                      value: formatCompetitiveRating(insights?.currentRating ?? 0),
                      icon: Trophy,
                      accent: "bg-blue-100 text-blue-700",
                  },
                  {
                      key: "averageRating",
                      label: t("profile.averageRating"),
                      value: formatCompetitiveRating(insights?.averageRating ?? 0),
                      icon: Gauge,
                      accent: "bg-slate-100 text-slate-700",
                  },
              ]
            : [];

    const items = [
        ...ratingItems,
        {
            key: "matchesPlayed",
            label: t("profile.matchesPlayed"),
            value: baseSummary.matchesPlayed,
            icon: Activity,
            accent: "bg-indigo-100 text-indigo-700",
        },
        {
            key: "winRate",
            label: t("profile.winRate"),
            value: `${baseSummary.winRate}%`,
            icon: TrendingUp,
            accent: "bg-emerald-100 text-emerald-700",
        },
        {
            key: "wins",
            label: t("profile.wins"),
            value: baseSummary.wins,
            icon: BarChart3,
            accent: "bg-emerald-100 text-emerald-700",
        },
        {
            key: "losses",
            label: t("profile.losses"),
            value: baseSummary.losses,
            icon: XCircle,
            accent: "bg-red-100 text-red-700",
        },
        {
            key: "currentStreak",
            label: t("profile.currentStreak"),
            value: baseSummary.currentStreak,
            icon: Flame,
            accent: "bg-amber-100 text-amber-700",
        },
        {
            key: "bestStreak",
            label: t("profile.bestStreak"),
            value: baseSummary.bestStreak,
            icon: Flame,
            accent: "bg-orange-100 text-orange-700",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <article
                        key={item.key}
                        className="rounded-[1.5rem] border border-slate-100 bg-[linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(255,255,255,1)_100%)] p-4 sm:rounded-[1.75rem]"
                    >
                        <span
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${item.accent} sm:h-11 sm:w-11`}
                        >
                            <Icon size={18} />
                        </span>
                        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
                            {item.label}
                        </p>
                        <p className="mt-2 text-xl font-black leading-none text-slate-900 sm:text-2xl">
                            {item.value}
                        </p>
                    </article>
                );
            })}
        </div>
    );
}
