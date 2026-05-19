import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ProfileHistoryModeTabs } from "../components/ProfileHistoryModeTabs";
import { ProfileMatchHistoryCards } from "../components/ProfileMatchHistoryCards";
import { useProfileMatchHistory } from "../hooks/useProfileMatchHistory";
import { CompetitiveInsightsFilters } from "../components/CompetitiveInsightsFilters";
import type { ProfileMatchHistoryModeFilter } from "../types/profileStats.types";
import type { CompetitiveInsightsFilter } from "../types/profileCompetitiveInsights.types";
import { applyMatchHistoryFilter } from "../utils/profileMatchHistory.utils";

export function ProfileHistoryPage() {
    const { t } = useTranslation();
    const { profile } = useAuth();
    const [selectedMode, setSelectedMode] =
        useState<ProfileMatchHistoryModeFilter>("all");
    const [selectedFilter, setSelectedFilter] =
        useState<CompetitiveInsightsFilter>("last_10_matches");
    const {
        matches,
        loading,
        error,
    } = useProfileMatchHistory(profile?.id, {
        modeFilter: "all",
    });

    const visibleMatches = applyMatchHistoryFilter(
        matches.filter((match) => {
            if (selectedMode === "all") {
                return true;
            }

            return match.event.mode === selectedMode;
        }),
        selectedFilter
    );

    if (!profile) {
        return <p className="text-slate-500">{t("profile.loading")}</p>;
    }

    return (
        <section className="space-y-5 sm:space-y-6">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6 md:p-8">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <Link
                                to="/profile"
                                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700"
                            >
                                <ArrowLeft size={14} />
                                {t("profile.backToProfile")}
                            </Link>

                            <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-blue-600 sm:text-sm">
                                {t("profile.premiumHistoryEyebrow")}
                            </p>
                            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                                {t("profile.fullHistoryTitle")}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                {t("profile.fullHistoryBody")}
                            </p>
                        </div>

                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                            {t("profile.validatedOnly")}
                        </span>
                    </div>

                    <ProfileHistoryModeTabs
                        value={selectedMode}
                        onChange={setSelectedMode}
                        includeAll
                    />

                    <CompetitiveInsightsFilters
                        selectedFilter={selectedFilter}
                        onChange={setSelectedFilter}
                    />

                    {error ? (
                        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </p>
                    ) : null}

                    {loading ? (
                        <p className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">
                            {t("profile.loadingRecentMatches")}
                        </p>
                    ) : visibleMatches.length === 0 ? (
                        <div className="rounded-3xl bg-slate-50 p-6 text-center">
                            <p className="font-bold text-slate-900">
                                {selectedMode === "casual"
                                    ? t("profile.noCasualHistory")
                                    : selectedMode === "competitive"
                                      ? t("profile.noCompetitiveHistory")
                                      : t("profile.noAnyHistory")}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                {selectedMode === "casual"
                                    ? t("profile.noCasualHistoryBody")
                                    : selectedMode === "competitive"
                                      ? t("profile.noCompetitiveHistoryBody")
                                      : t("profile.noAnyHistoryBody")}
                            </p>
                        </div>
                    ) : (
                        <ProfileMatchHistoryCards matches={visibleMatches} />
                    )}
                </div>
            </div>
        </section>
    );
}
