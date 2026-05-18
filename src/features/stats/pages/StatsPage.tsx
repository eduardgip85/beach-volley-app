import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  MapPin,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";
import { AnalyticsBarChartCard } from "../components/AnalyticsBarChartCard";
import { AnalyticsFilterTabs } from "../components/AnalyticsFilterTabs";
import { AnalyticsPanel } from "../components/AnalyticsPanel";
import { AnalyticsPieChartCard } from "../components/AnalyticsPieChartCard";
import { AnalyticsSummaryCard } from "../components/AnalyticsSummaryCard";
import { AnalyticsTopListCard } from "../components/AnalyticsTopListCard";
import { StatsLoadingSkeleton } from "../components/StatsLoadingSkeleton";
import type { AnalyticsTimeFilter } from "../types/stats.types";

export function StatsPage() {
  const [selectedFilter, setSelectedFilter] =
    useState<AnalyticsTimeFilter>("last_30_days");
  const { stats, loading, error } = useAdminAnalytics(selectedFilter);

  const peakDaysChartData = useMemo(
    () =>
      (stats?.engagementAnalytics.peakActivityDays ?? []).map((item) => ({
        label: item.day,
        count: item.count,
      })),
    [stats]
  );

  if (loading) {
    return <StatsLoadingSkeleton />;
  }

  if (error || !stats) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Analytics error</h1>
        <p className="mt-2 text-slate-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
            Admin analytics
          </p>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            Platform performance dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Track user growth, match mix, engagement and competitive rating
            health from a single aggregated view.
          </p>
        </div>

        <AnalyticsFilterTabs
          value={selectedFilter}
          onChange={setSelectedFilter}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <AnalyticsSummaryCard
          label="Total users"
          value={stats.userAnalytics.totalUsers}
          helper={`${stats.userAnalytics.activeUsers} active in selected range`}
          accent="blue"
        />
        <AnalyticsSummaryCard
          label="Total matches"
          value={stats.matchAnalytics.totalMatches}
          helper={`${stats.matchAnalytics.matchesCompleted} finished · ${stats.matchAnalytics.cancelledMatches} cancelled`}
          accent="emerald"
        />
        <AnalyticsSummaryCard
          label="Average rating"
          value={stats.rankingAnalytics.averageRating}
          helper={`${stats.userAnalytics.competitiveUsers} competitive users`}
          accent="amber"
        />
        <AnalyticsSummaryCard
          label="Verified equipment"
          value={stats.userAnalytics.verifiedEquipmentUsers}
          helper="Players with verified ball, net or equipment"
          accent="slate"
        />
        <AnalyticsSummaryCard
          label="New users"
          value={stats.userAnalytics.newUsersMonth}
          helper={`${stats.userAnalytics.newUsersWeek} joined in the last 7 days`}
          accent="rose"
        />
        <AnalyticsSummaryCard
          label="Avg players/event"
          value={stats.engagementAnalytics.averagePlayersPerEvent}
          helper="Across events in the selected range"
          accent="blue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsBarChartCard
          title="User growth"
          description="New users over the selected time range."
          data={stats.userAnalytics.newUsersTrend}
          color="#2563eb"
        />

        <AnalyticsBarChartCard
          title="Event activity"
          description="How many events were scheduled over time."
          data={stats.matchAnalytics.eventsTrend}
          color="#0f172a"
        />

        <AnalyticsPieChartCard
          title="Casual vs competitive"
          description="Distribution of match formats."
          data={stats.matchAnalytics.formatRatio}
          colors={["#10b981", "#2563eb"]}
        />

        <AnalyticsPieChartCard
          title="Public vs private"
          description="Visibility mix for matches."
          data={stats.matchAnalytics.visibilityRatio}
          colors={["#0f172a", "#f59e0b"]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsTopListCard
          title="Most active users"
          description="Top players by event activity in the selected range."
          items={stats.engagementAnalytics.mostActiveUsers}
        />

        <AnalyticsTopListCard
          title="Most active locations"
          description="Courts and locations with the highest event volume."
          items={stats.engagementAnalytics.mostActiveLocations}
        />

        <AnalyticsTopListCard
          title="Highest rated players"
          description="Competitive leaderboard snapshot."
          items={stats.rankingAnalytics.highestRatedPlayers}
        />

        <AnalyticsBarChartCard
          title="Peak activity days"
          description="Days of the week with the most scheduled events."
          data={peakDaysChartData}
          color="#f59e0b"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_minmax(0,1fr)]">
        <AnalyticsBarChartCard
          title="Rating distribution"
          description="How competitive ratings are spread across active players."
          data={stats.rankingAnalytics.ratingDistribution}
          color="#8b5cf6"
        />

        <AnalyticsPanel
          title="Quick insights"
          description="Useful operational takeaways from the current snapshot."
        >
          <div className="space-y-3">
            <InsightRow
              icon={<Users size={18} />}
              label="Active users"
              value={`${stats.userAnalytics.activeUsers} players active in the selected range`}
            />
            <InsightRow
              icon={<Trophy size={18} />}
              label="Competitive share"
              value={`${stats.matchAnalytics.competitiveMatches} competitive matches scheduled`}
            />
            <InsightRow
              icon={<UserCheck size={18} />}
              label="Verified equipment"
              value={`${stats.userAnalytics.verifiedEquipmentUsers} users can bring verified gear`}
            />
            <InsightRow
              icon={<MapPin size={18} />}
              label="Top location"
              value={
                stats.engagementAnalytics.mostActiveLocations[0]
                  ? `${stats.engagementAnalytics.mostActiveLocations[0].locationName} leads with ${stats.engagementAnalytics.mostActiveLocations[0].eventsCount} events`
                  : "No location activity yet"
              }
            />
            <InsightRow
              icon={<Activity size={18} />}
              label="Completion"
              value={`${stats.matchAnalytics.matchesCompleted} matches have finished in the selected range`}
            />
            <InsightRow
              icon={<BarChart3 size={18} />}
              label="Generated"
              value={new Date(stats.metadata.generatedAt).toLocaleString()}
            />
          </div>
        </AnalyticsPanel>
      </div>
    </section>
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
