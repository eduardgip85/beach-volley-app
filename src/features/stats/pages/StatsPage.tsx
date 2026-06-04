import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  MapPin,
  MessageSquareWarning,
  Trophy,
  UserCheck,
  Users,
  Vote,
} from "lucide-react";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";
import { AnalyticsBarChartCard } from "../components/AnalyticsBarChartCard";
import { AnalyticsFilterTabs } from "../components/AnalyticsFilterTabs";
import { AnalyticsPanel } from "../components/AnalyticsPanel";
import { AnalyticsPieChartCard } from "../components/AnalyticsPieChartCard";
import { AnalyticsRecentRegistrationsCard } from "../components/AnalyticsRecentRegistrationsCard";
import { AnalyticsSummaryCard } from "../components/AnalyticsSummaryCard";
import { AnalyticsTopListCard } from "../components/AnalyticsTopListCard";
import { StatsLoadingSkeleton } from "../components/StatsLoadingSkeleton";
import type { AnalyticsTimeFilter } from "../types/stats.types";

export function StatsPage() {
  const { t, i18n } = useTranslation();
  const [selectedFilter, setSelectedFilter] =
    useState<AnalyticsTimeFilter>("last_30_days");
  const { stats, loading, error } = useAdminAnalytics(selectedFilter);

  const weekdayLabels = useMemo(
    () => ({
      Monday: t("adminStats.weekdays.monday"),
      Tuesday: t("adminStats.weekdays.tuesday"),
      Wednesday: t("adminStats.weekdays.wednesday"),
      Thursday: t("adminStats.weekdays.thursday"),
      Friday: t("adminStats.weekdays.friday"),
      Saturday: t("adminStats.weekdays.saturday"),
      Sunday: t("adminStats.weekdays.sunday"),
    }),
    [t]
  );

  const peakDaysChartData = useMemo(
    () =>
      (stats?.engagementAnalytics.peakActivityDays ?? []).map((item) => ({
        label: weekdayLabels[item.day as keyof typeof weekdayLabels] ?? item.day,
        count: item.count,
      })),
    [stats, weekdayLabels]
  );

  const formatRatioData = useMemo(
    () =>
      (stats?.matchAnalytics.formatRatio ?? []).map((item) => ({
        ...item,
        name:
          item.name === "Casual"
            ? t("eventModes.casual")
            : item.name === "Competitive"
              ? t("eventModes.competitive")
              : item.name,
      })),
    [stats, t]
  );

  const visibilityRatioData = useMemo(
    () =>
      (stats?.matchAnalytics.visibilityRatio ?? []).map((item) => ({
        ...item,
        name:
          item.name === "Public"
            ? t("eventVisibility.public")
            : item.name === "Private"
              ? t("eventVisibility.private")
              : item.name,
      })),
    [stats, t]
  );

  const ideaStatusLabels = useMemo(
    () => ({
      open: t("adminStats.ideas.status.open"),
      planned: t("adminStats.ideas.status.planned"),
      in_progress: t("adminStats.ideas.status.inProgress"),
      done: t("adminStats.ideas.status.done"),
      rejected: t("adminStats.ideas.status.rejected"),
      duplicate: t("adminStats.ideas.status.duplicate"),
      hidden: t("adminStats.ideas.status.hidden"),
    }),
    [t]
  );

  const ideaModerationLabels = useMemo(
    () => ({
      pending: t("adminStats.ideas.moderation.pending"),
      approved: t("adminStats.ideas.moderation.approved"),
      hidden: t("adminStats.ideas.moderation.hidden"),
    }),
    [t]
  );

  const ideaStatusRatioData = useMemo(
    () =>
      (stats?.ideaAnalytics.statusRatio ?? []).map((item) => ({
        ...item,
        name:
          ideaStatusLabels[item.name as keyof typeof ideaStatusLabels] ??
          item.name,
      })),
    [ideaStatusLabels, stats]
  );

  const ideaModerationRatioData = useMemo(
    () =>
      (stats?.ideaAnalytics.moderationRatio ?? []).map((item) => ({
        ...item,
        name:
          ideaModerationLabels[
            item.name as keyof typeof ideaModerationLabels
          ] ?? item.name,
      })),
    [ideaModerationLabels, stats]
  );

  if (loading) {
    return <StatsLoadingSkeleton />;
  }

  if (error || !stats) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          {t("adminStats.errorTitle")}
        </h1>
        <p className="mt-2 text-slate-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
            {t("adminStats.eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            {t("adminStats.title")}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            {t("adminStats.body")}
          </p>
        </div>

        <AnalyticsFilterTabs
          value={selectedFilter}
          onChange={setSelectedFilter}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AnalyticsSummaryCard
          label={t("adminStats.cards.totalUsers")}
          value={stats.userAnalytics.totalUsers}
          helper={t("adminStats.helpers.activeUsersInRange", {
            count: stats.userAnalytics.activeUsers,
          })}
          accent="blue"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.totalMatches")}
          value={stats.matchAnalytics.totalMatches}
          helper={t("adminStats.helpers.matchesFinishedCancelled", {
            finished: stats.matchAnalytics.matchesCompleted,
            cancelled: stats.matchAnalytics.cancelledMatches,
          })}
          accent="emerald"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.averageRating")}
          value={stats.rankingAnalytics.averageRating}
          helper={t("adminStats.helpers.competitiveUsers", {
            count: stats.userAnalytics.competitiveUsers,
          })}
          accent="amber"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.verifiedEquipment")}
          value={stats.userAnalytics.verifiedEquipmentUsers}
          helper={t("adminStats.helpers.verifiedEquipmentUsers")}
          accent="slate"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.newUsers")}
          value={stats.userAnalytics.newUsersMonth}
          helper={t("adminStats.helpers.joinedLast7Days", {
            count: stats.userAnalytics.newUsersWeek,
          })}
          accent="rose"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.newToday")}
          value={stats.userAnalytics.newUsersToday}
          helper={t("adminStats.helpers.freshRegistrationsSinceMidnight")}
          accent="slate"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.onboardingDone")}
          value={`${stats.userAnalytics.onboardingCompletionRate}%`}
          helper={t("adminStats.helpers.onboardingCompletedUsers", {
            count: stats.userAnalytics.onboardingCompletedUsers,
          })}
          accent="emerald"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.avgPlayersPerEvent")}
          value={stats.engagementAnalytics.averagePlayersPerEvent}
          helper={t("adminStats.helpers.avgPlayersRange")}
          accent="blue"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.productIdeas")}
          value={stats.ideaAnalytics.totalIdeas}
          helper={t("adminStats.helpers.pendingIdeas", {
            count: stats.ideaAnalytics.pendingIdeas,
          })}
          accent="amber"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.newIdeas")}
          value={stats.ideaAnalytics.ideasSubmittedInRange}
          helper={t("adminStats.helpers.ideasInSelectedRange")}
          accent="blue"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.ideaVotes")}
          value={stats.ideaAnalytics.totalVotes}
          helper={t("adminStats.helpers.averageIdeaVotes", {
            count: stats.ideaAnalytics.averageVotesPerIdea,
          })}
          accent="emerald"
        />
        <AnalyticsSummaryCard
          label={t("adminStats.cards.ideaDone")}
          value={stats.ideaAnalytics.doneIdeas}
          helper={t("adminStats.helpers.ideaPipeline", {
            planned: stats.ideaAnalytics.plannedIdeas,
            inProgress: stats.ideaAnalytics.inProgressIdeas,
          })}
          accent="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsBarChartCard
          title={t("adminStats.charts.userGrowthTitle")}
          description={t("adminStats.charts.userGrowthDescription")}
          data={stats.userAnalytics.newUsersTrend}
          color="#2563eb"
        />

        <AnalyticsBarChartCard
          title={t("adminStats.charts.eventActivityTitle")}
          description={t("adminStats.charts.eventActivityDescription")}
          data={stats.matchAnalytics.eventsTrend}
          color="#0f172a"
        />

        <AnalyticsPieChartCard
          title={t("adminStats.charts.casualVsCompetitiveTitle")}
          description={t("adminStats.charts.casualVsCompetitiveDescription")}
          data={formatRatioData}
          colors={["#10b981", "#2563eb"]}
        />

        <AnalyticsPieChartCard
          title={t("adminStats.charts.publicVsPrivateTitle")}
          description={t("adminStats.charts.publicVsPrivateDescription")}
          data={visibilityRatioData}
          colors={["#0f172a", "#f59e0b"]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsTopListCard
          title={t("adminStats.charts.mostActiveUsersTitle")}
          description={t("adminStats.charts.mostActiveUsersDescription")}
          items={stats.engagementAnalytics.mostActiveUsers}
        />

        <AnalyticsTopListCard
          title={t("adminStats.charts.mostActiveLocationsTitle")}
          description={t("adminStats.charts.mostActiveLocationsDescription")}
          items={stats.engagementAnalytics.mostActiveLocations}
        />

        <AnalyticsTopListCard
          title={t("adminStats.charts.highestRatedPlayersTitle")}
          description={t("adminStats.charts.highestRatedPlayersDescription")}
          items={stats.rankingAnalytics.highestRatedPlayers}
        />

        <AnalyticsBarChartCard
          title={t("adminStats.charts.peakActivityDaysTitle")}
          description={t("adminStats.charts.peakActivityDaysDescription")}
          data={peakDaysChartData}
          color="#f59e0b"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsBarChartCard
          title={t("adminStats.ideas.trendTitle")}
          description={t("adminStats.ideas.trendDescription")}
          data={stats.ideaAnalytics.ideasTrend}
          color="#f59e0b"
        />

        <AnalyticsPieChartCard
          title={t("adminStats.ideas.statusTitle")}
          description={t("adminStats.ideas.statusDescription")}
          data={ideaStatusRatioData}
          colors={[
            "#2563eb",
            "#f59e0b",
            "#10b981",
            "#ef4444",
            "#64748b",
            "#0f172a",
          ]}
        />

        <AnalyticsPieChartCard
          title={t("adminStats.ideas.moderationTitle")}
          description={t("adminStats.ideas.moderationDescription")}
          data={ideaModerationRatioData}
          colors={["#f59e0b", "#10b981", "#0f172a"]}
        />

        <AnalyticsPanel
          title={t("adminStats.ideas.topIdeasTitle")}
          description={t("adminStats.ideas.topIdeasDescription")}
        >
          <TopIdeasList
            items={stats.ideaAnalytics.topVotedIdeas}
            emptyLabel={t("adminStats.ideas.noTopIdeas")}
            votesLabel={t("adminStats.ideas.votes")}
            statusLabels={ideaStatusLabels}
            moderationLabels={ideaModerationLabels}
          />
        </AnalyticsPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_minmax(0,1fr)]">
        <AnalyticsBarChartCard
          title={t("adminStats.charts.ratingDistributionTitle")}
          description={t("adminStats.charts.ratingDistributionDescription")}
          data={stats.rankingAnalytics.ratingDistribution}
          color="#8b5cf6"
        />

        <AnalyticsPanel
          title={t("adminStats.panels.quickInsightsTitle")}
          description={t("adminStats.panels.quickInsightsDescription")}
        >
          <div className="space-y-3">
            <InsightRow
              icon={<Users size={18} />}
              label={t("adminStats.insights.activeUsersLabel")}
              value={t("adminStats.insights.activeUsersValue", {
                count: stats.userAnalytics.activeUsers,
              })}
            />
            <InsightRow
              icon={<Trophy size={18} />}
              label={t("adminStats.insights.competitiveShareLabel")}
              value={t("adminStats.insights.competitiveShareValue", {
                count: stats.matchAnalytics.competitiveMatches,
              })}
            />
            <InsightRow
              icon={<UserCheck size={18} />}
              label={t("adminStats.insights.verifiedEquipmentLabel")}
              value={t("adminStats.insights.verifiedEquipmentValue", {
                count: stats.userAnalytics.verifiedEquipmentUsers,
              })}
            />
            <InsightRow
              icon={<MapPin size={18} />}
              label={t("adminStats.insights.topLocationLabel")}
              value={
                stats.engagementAnalytics.mostActiveLocations[0]
                  ? t("adminStats.insights.topLocationValue", {
                      location:
                        stats.engagementAnalytics.mostActiveLocations[0]
                          .locationName,
                      count:
                        stats.engagementAnalytics.mostActiveLocations[0]
                          .eventsCount,
                    })
                  : t("adminStats.insights.noLocationActivity")
              }
            />
            <InsightRow
              icon={<Activity size={18} />}
              label={t("adminStats.insights.completionLabel")}
              value={t("adminStats.insights.completionValue", {
                count: stats.matchAnalytics.matchesCompleted,
              })}
            />
            <InsightRow
              icon={<Lightbulb size={18} />}
              label={t("adminStats.insights.pendingIdeasLabel")}
              value={t("adminStats.insights.pendingIdeasValue", {
                count: stats.ideaAnalytics.pendingIdeas,
              })}
            />
            <InsightRow
              icon={<BarChart3 size={18} />}
              label={t("adminStats.insights.generatedLabel")}
              value={new Date(stats.metadata.generatedAt).toLocaleString(
                i18n.language
              )}
            />
          </div>
        </AnalyticsPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AnalyticsRecentRegistrationsCard
          title={t("adminStats.recentRegistrations.title")}
          description={t("adminStats.recentRegistrations.description")}
          items={stats.userAnalytics.recentRegistrations}
        />

        <AnalyticsPanel
          title={t("adminStats.registrationHealth.title")}
          description={t("adminStats.registrationHealth.description")}
        >
          <div className="space-y-3">
            <InsightRow
              icon={<Users size={18} />}
              label={t("adminStats.registrationHealth.newTodayLabel")}
              value={t("adminStats.registrationHealth.newTodayValue", {
                count: stats.userAnalytics.newUsersToday,
              })}
            />
            <InsightRow
              icon={<Activity size={18} />}
              label={t("adminStats.registrationHealth.last7DaysLabel")}
              value={t("adminStats.registrationHealth.last7DaysValue", {
                count: stats.userAnalytics.newUsersWeek,
              })}
            />
            <InsightRow
              icon={<BarChart3 size={18} />}
              label={t("adminStats.registrationHealth.last30DaysLabel")}
              value={t("adminStats.registrationHealth.last30DaysValue", {
                count: stats.userAnalytics.newUsersMonth,
              })}
            />
            <InsightRow
              icon={<UserCheck size={18} />}
              label={t("adminStats.registrationHealth.onboardingConversionLabel")}
              value={t(
                "adminStats.registrationHealth.onboardingConversionValue",
                {
                  count: stats.userAnalytics.onboardingCompletionRate,
                }
              )}
            />
          </div>
        </AnalyticsPanel>
      </div>
    </section>
  );
}

function TopIdeasList({
  items,
  emptyLabel,
  votesLabel,
  statusLabels,
  moderationLabels,
}: {
  items: {
    id: string;
    title: string;
    voteCount: number;
    status: string;
    moderationStatus: string;
  }[];
  emptyLabel: string;
  votesLabel: string;
  statusLabels: Record<string, string>;
  moderationLabels: Record<string, string>;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 sm:px-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-sm font-black text-amber-700 sm:h-10 sm:w-10">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-950">
              {item.title}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                <Vote size={12} />
                {item.voteCount} {votesLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                <CheckCircle2 size={12} />
                {statusLabels[item.status] ?? item.status}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                <MessageSquareWarning size={12} />
                {moderationLabels[item.moderationStatus] ??
                  item.moderationStatus}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 sm:px-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white sm:h-10 sm:w-10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-950">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{value}</p>
      </div>
    </div>
  );
}
