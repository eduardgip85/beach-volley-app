import { BarChart3, Swords, Target, Trophy } from "lucide-react";
import { useState } from "react";
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
                      value: stats.competitiveRating,
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
                      key: "eloImpact",
                      label: "Elo impact",
                      icon: Trophy,
                      accent: "bg-slate-100 text-slate-700",
                      value: "No Elo",
                  },
              ];

    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                        Performance
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        Your profile stats
                    </h2>
                </div>

                <div className="flex rounded-full bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => setSelectedMode("competitive")}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
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
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.key}
                                className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                            >
                                <span
                                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.accent}`}
                                >
                                    <Icon size={20} />
                                </span>

                                <p className="mt-4 text-sm font-medium text-slate-500">
                                    {item.label}
                                </p>
                                <p className="mt-1 text-3xl font-black text-slate-900">
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
