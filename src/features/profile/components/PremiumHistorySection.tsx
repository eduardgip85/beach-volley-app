import { Activity, LineChart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import { useProfileMatchHistory } from "../hooks/useProfileMatchHistory";
import type {
    CompetitiveInsightsFilter,
    CompetitiveProfileInsights,
} from "../types/profileCompetitiveInsights.types";
import { CompetitiveInsightsFilters } from "./CompetitiveInsightsFilters";
import { CompetitiveMatchHistoryCard } from "./CompetitiveMatchHistoryCard";
import { CompetitiveStatsOverview } from "./CompetitiveStatsOverview";
import { ProfileHistoryModeTabs } from "./ProfileHistoryModeTabs";
import { ProfileMatchHistoryCards } from "./ProfileMatchHistoryCards";
import { RatingEvolutionChart } from "./RatingEvolutionChart";
import {
    applyMatchHistoryFilter,
    buildMatchHistorySummary,
} from "../utils/profileMatchHistory.utils";

interface PremiumHistorySectionProps {
    userId?: string;
    insights: CompetitiveProfileInsights;
    selectedFilter: CompetitiveInsightsFilter;
    loading?: boolean;
    error?: string;
    onFilterChange: (value: CompetitiveInsightsFilter) => void;
}

export function PremiumHistorySection({
    userId,
    insights,
    selectedFilter,
    loading = false,
    error = "",
    onFilterChange,
}: PremiumHistorySectionProps) {
    const { t } = useTranslation();
    const [selectedMode, setSelectedMode] = useState<"competitive" | "casual">(
        "competitive"
    );
    const {
        matches: casualMatches,
        loading: casualLoading,
        error: casualError,
    } = useProfileMatchHistory(userId, {
        modeFilter: "casual",
    });
    const filteredCasualMatches = applyMatchHistoryFilter(
        casualMatches,
        selectedFilter
    );
    const visibleCasualMatches = filteredCasualMatches.slice(0, 3);
    const casualSummary = buildMatchHistorySummary(filteredCasualMatches);
    const visibleCompetitiveMatches = insights.matchHistory.slice(0, 3);

    return (
        <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600 sm:text-sm">
                            {t("profile.premiumHistoryEyebrow")}
                        </p>
                        <h2 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
                            {t("profile.premiumHistoryTitle")}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {t("profile.premiumHistoryBody")}
                        </p>
                    </div>

                    <Link
                        to="/profile/history"
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
                    >
                        {t("profile.viewAllHistory")}
                    </Link>
                </div>

                <div className="flex flex-col gap-3">
                    <ProfileHistoryModeTabs
                        value={selectedMode}
                        onChange={(value) =>
                            setSelectedMode(value === "casual" ? "casual" : "competitive")
                        }
                    />

                    <CompetitiveInsightsFilters
                        selectedFilter={selectedFilter}
                        onChange={onFilterChange}
                    />
                </div>

                {selectedMode === "competitive" ? (
                    <>
                        {error ? (
                            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </p>
                        ) : null}

                        <CompetitiveStatsOverview insights={insights} />

                        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr] xl:gap-6">
                            <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-4 sm:rounded-3xl sm:p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                        <LineChart size={20} />
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            {t("profile.ratingEvolution")}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {t("profile.ratingEvolutionBody")}
                                        </p>
                                    </div>
                                </div>

                                <RatingEvolutionChart
                                    points={insights.chartPoints}
                                    loading={loading}
                                />
                            </div>

                            <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-4 sm:rounded-3xl sm:p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                        <Activity size={20} />
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            {t("profile.competitiveSummary")}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {t("profile.competitiveSummaryBody")}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
                                    <SummaryCard
                                        label={t("profile.currentRating")}
                                        value={formatCompetitiveRating(insights.currentRating)}
                                        accent="bg-blue-600 text-white"
                                    />
                                    <SummaryCard
                                        label={t("profile.averageRating")}
                                        value={formatCompetitiveRating(insights.averageRating)}
                                        accent="bg-slate-900 text-white"
                                    />
                                    <SummaryCard
                                        label={t("profile.currentStreak")}
                                        value={insights.currentStreak}
                                        accent="bg-amber-500 text-white"
                                    />
                                    <SummaryCard
                                        label={t("profile.bestStreak")}
                                        value={insights.bestStreak}
                                        accent="bg-emerald-600 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="mb-4">
                                <h3 className="text-lg font-black text-slate-900 sm:text-xl">
                                    {t("profile.matchHistory")}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {t("profile.premiumHistoryLatestThree")}
                                </p>
                            </div>

                            {loading ? (
                                <p className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">
                                    {t("profile.loadingCompetitiveHistory")}
                                </p>
                            ) : visibleCompetitiveMatches.length === 0 ? (
                                <div className="rounded-3xl bg-slate-50 p-6 text-center">
                                    <p className="font-bold text-slate-900">
                                        {t("profile.noCompetitiveHistory")}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {t("profile.noCompetitiveHistoryBody")}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {visibleCompetitiveMatches.map((match) => (
                                        <CompetitiveMatchHistoryCard
                                            key={match.historyId}
                                            match={match}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div>
                        <CompetitiveStatsOverview
                            summary={casualSummary}
                            variant="casual"
                        />

                        <div className="mb-4 mt-6">
                            <h3 className="text-lg font-black text-slate-900 sm:text-xl">
                                {t("profile.casualHistoryTitle")}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {t("profile.casualHistoryBody")}
                            </p>
                        </div>

                        {casualError ? (
                            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                {casualError}
                            </p>
                        ) : null}

                        {casualLoading ? (
                            <p className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">
                                {t("profile.loadingRecentMatches")}
                            </p>
                        ) : visibleCasualMatches.length === 0 ? (
                            <div className="rounded-3xl bg-slate-50 p-6 text-center">
                                <p className="font-bold text-slate-900">
                                    {t("profile.noCasualHistory")}
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    {t("profile.noCasualHistoryBody")}
                                </p>
                            </div>
                        ) : (
                            <ProfileMatchHistoryCards matches={visibleCasualMatches} />
                        )}
                    </div>
                )}
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
        <div className="min-w-0 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
                {label}
            </p>
            <div
                className={`mt-3 inline-flex max-w-full rounded-full px-3 py-1 text-sm font-bold ${accent}`}
            >
                {value}
            </div>
        </div>
    );
}
