import { Activity, LineChart } from "lucide-react";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import { CompetitiveInsightsFilters } from "./CompetitiveInsightsFilters";
import { CompetitiveMatchHistoryCard } from "./CompetitiveMatchHistoryCard";
import { CompetitiveStatsOverview } from "./CompetitiveStatsOverview";
import { RatingEvolutionChart } from "./RatingEvolutionChart";
import type {
    CompetitiveInsightsFilter,
    CompetitiveProfileInsights,
} from "../types/profileCompetitiveInsights.types";

interface CompetitiveInsightsSectionProps {
    insights: CompetitiveProfileInsights;
    selectedFilter: CompetitiveInsightsFilter;
    loading?: boolean;
    error?: string;
    onFilterChange: (value: CompetitiveInsightsFilter) => void;
}

export function CompetitiveInsightsSection({
    insights,
    selectedFilter,
    loading = false,
    error = "",
    onFilterChange,
}: CompetitiveInsightsSectionProps) {
    return (
        <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                            Competitive history
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                            Rating evolution and personal performance
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Track how your competitive rating moves, revisit recent
                            validated matches, and keep an eye on your momentum.
                        </p>
                    </div>

                    <CompetitiveInsightsFilters
                        selectedFilter={selectedFilter}
                        onChange={onFilterChange}
                    />
                </div>

                {error ? (
                    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                ) : null}

                <CompetitiveStatsOverview insights={insights} />

                <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                <LineChart size={20} />
                            </span>
                            <div>
                                <h3 className="font-bold text-slate-900">
                                    Rating evolution
                                </h3>
                                <p className="text-sm text-slate-500">
                                    See how your accepted competitive matches moved your rating.
                                </p>
                            </div>
                        </div>

                        <RatingEvolutionChart
                            points={insights.chartPoints}
                            loading={loading}
                        />
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                <Activity size={20} />
                            </span>
                            <div>
                                <h3 className="font-bold text-slate-900">Competitive summary</h3>
                                <p className="text-sm text-slate-500">
                                    Current rating, average level and overall streaks.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <SummaryCard
                                label="Current rating"
                                value={formatCompetitiveRating(insights.currentRating)}
                                accent="bg-blue-600 text-white"
                            />
                            <SummaryCard
                                label="Average rating"
                                value={formatCompetitiveRating(insights.averageRating)}
                                accent="bg-slate-900 text-white"
                            />
                            <SummaryCard
                                label="Current streak"
                                value={insights.currentStreak}
                                accent="bg-amber-500 text-white"
                            />
                            <SummaryCard
                                label="Best streak"
                                value={insights.bestStreak}
                                accent="bg-emerald-600 text-white"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Match history</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Competitive matches with result, rating delta and set summary.
                        </p>
                    </div>

                    {loading ? (
                        <p className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">
                            Loading competitive match history...
                        </p>
                    ) : insights.matchHistory.length === 0 ? (
                        <div className="rounded-3xl bg-slate-50 p-6 text-center">
                            <p className="font-bold text-slate-900">
                                No competitive history for this range yet
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Play and validate competitive matches to unlock your graph and
                                history cards.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {insights.matchHistory.map((match) => (
                                <CompetitiveMatchHistoryCard
                                    key={match.historyId}
                                    match={match}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function SummaryCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: string | number;
    accent: string;
}) {
    return (
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>
            <div
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold ${accent}`}
            >
                {value}
            </div>
        </div>
    );
}
