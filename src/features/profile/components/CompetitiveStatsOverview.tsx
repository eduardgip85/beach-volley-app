import { Activity, BarChart3, Flame, Gauge, Trophy, TrendingUp, XCircle } from "lucide-react";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import type { CompetitiveProfileInsights } from "../types/profileCompetitiveInsights.types";

interface CompetitiveStatsOverviewProps {
    insights: CompetitiveProfileInsights;
}

export function CompetitiveStatsOverview({
    insights,
}: CompetitiveStatsOverviewProps) {
    const items = [
        {
            key: "currentRating",
            label: "Current rating",
            value: formatCompetitiveRating(insights.currentRating),
            icon: Trophy,
            accent: "bg-blue-100 text-blue-700",
        },
        {
            key: "averageRating",
            label: "Average rating",
            value: formatCompetitiveRating(insights.averageRating),
            icon: Gauge,
            accent: "bg-slate-100 text-slate-700",
        },
        {
            key: "matchesPlayed",
            label: "Matches played",
            value: insights.matchesPlayed,
            icon: Activity,
            accent: "bg-indigo-100 text-indigo-700",
        },
        {
            key: "winRate",
            label: "Win rate",
            value: `${insights.winRate}%`,
            icon: TrendingUp,
            accent: "bg-emerald-100 text-emerald-700",
        },
        {
            key: "wins",
            label: "Wins",
            value: insights.wins,
            icon: BarChart3,
            accent: "bg-emerald-100 text-emerald-700",
        },
        {
            key: "losses",
            label: "Losses",
            value: insights.losses,
            icon: XCircle,
            accent: "bg-red-100 text-red-700",
        },
        {
            key: "currentStreak",
            label: "Current streak",
            value: insights.currentStreak,
            icon: Flame,
            accent: "bg-amber-100 text-amber-700",
        },
        {
            key: "bestStreak",
            label: "Best streak",
            value: insights.bestStreak,
            icon: Flame,
            accent: "bg-orange-100 text-orange-700",
        },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <article
                        key={item.key}
                        className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
                    >
                        <span
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.accent}`}
                        >
                            <Icon size={20} />
                        </span>
                        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-900">
                            {item.value}
                        </p>
                    </article>
                );
            })}
        </div>
    );
}
