import { BarChart3, Swords, Target, Trophy } from "lucide-react";
import { useState } from "react";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import type { ProfileStatsData } from "../types/profileStats.types";

interface ProfileStatsCardProps {
    stats: ProfileStatsData;
    loading?: boolean;
}

export function ProfileStatsCard({
    stats,
    loading = false,
}: ProfileStatsCardProps) {
    const [selectedMode, setSelectedMode] = useState<"competitive" | "casual">(
        "competitive"
    );
    const selectedStats =
        selectedMode === "competitive" ? stats.competitive : stats.casual;
    const statItems =
        selectedMode === "competitive"
            ? [
                  {
                      key: "competitiveRating",
                      label: "Competitive rating",
                      icon: Trophy,
                      accent: "bg-blue-100 text-blue-700",
                      value: formatCompetitiveRating(stats.competitiveRating),
                  },
                  {
                      key: "matchesPlayed",
                      label: "Matches played",
                      icon: Swords,
                      accent: "bg-slate-100 text-slate-700",
                      value: selectedStats.matchesPlayed,
                  },
                  {
                      key: "wins",
                      label: "Wins",
                      icon: BarChart3,
                      accent: "bg-emerald-100 text-emerald-700",
                      value: selectedStats.wins,
                  },
                  {
                      key: "losses",
                      label: "Losses",
                      icon: Target,
                      accent: "bg-red-100 text-red-700",
                      value: selectedStats.losses,
                  },
              ]
            : [
                  {
                      key: "matchesPlayed",
                      label: "Casual matches",
                      icon: Swords,
                      accent: "bg-amber-100 text-amber-700",
                      value: selectedStats.matchesPlayed,
                  },
                  {
                      key: "wins",
                      label: "Wins",
                      icon: BarChart3,
                      accent: "bg-emerald-100 text-emerald-700",
                      value: selectedStats.wins,
                  },
                  {
                      key: "losses",
                      label: "Losses",
                      icon: Target,
                      accent: "bg-red-100 text-red-700",
                      value: selectedStats.losses,
                  },
                  {
                      key: "winRate",
                      label: "Win rate",
                      icon: Trophy,
                      accent: "bg-blue-100 text-blue-700",
                      value:
                          selectedStats.matchesPlayed > 0
                              ? `${Math.round(
                                    (selectedStats.wins / selectedStats.matchesPlayed) * 100
                                )}%`
                              : "0%",
                  },
              ];

    return (
        <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600 sm:text-sm">
                        Performance
                    </p>
                    <h2 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
                        Your profile stats
                    </h2>
                </div>

                <div className="inline-flex self-start rounded-full bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => setSelectedMode("competitive")}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase sm:text-xs ${
                            selectedMode === "competitive"
                                ? "bg-blue-600 text-white"
                                : "text-slate-600"
                        }`}
                    >
                        Competitive
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedMode("casual")}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            selectedMode === "casual"
                                ? "bg-amber-500 text-white"
                                : "text-slate-600"
                        }`}
                    >
                        Casual
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-slate-500">Loading your statistics...</p>
            ) : (
                <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {statItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.key}
                                className="rounded-[1.5rem] border border-slate-100 bg-[linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(255,255,255,1)_100%)] p-4"
                            >
                                <span
                                    className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${item.accent}`}
                                >
                                    <Icon size={18} />
                                </span>

                                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-2xl font-black leading-none text-slate-900 sm:text-3xl">
                                    {item.value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
