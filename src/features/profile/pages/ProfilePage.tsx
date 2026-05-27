import {
  BarChart3,
  Shield,
  Trophy,
  Users,
  MapPin,
  Volleyball,
  Rows2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import { useProfileEvents } from "../hooks/useProfileEvents";
import { useProfileCompetitiveInsights } from "../hooks/useProfileCompetitiveInsights";
import { useProfileStats } from "../hooks/useProfileStats";
import { PremiumHistorySection } from "../components/PremiumHistorySection";
import { PlayerPreferencesSection } from "../components/PlayerPreferencesSection";
import { ProfileStatsCard } from "../components/ProfileStatsCard";
import { RecentMatchesSection } from "../components/RecentMatchesSection";
import { useMyEventInvitations } from "../../event-invitations/hooks/useMyEventInvitations";
import { MyEventInvitationsSection } from "../../event-invitations/components/MyEventInvitationsSection";
import { useMyEventJoinRequests } from "../../event-join-requests/hooks/useMyEventJoinRequests";
import { MyEventJoinRequestsSection } from "../../event-join-requests/components/MyEventJoinRequestsSection";
import { useMyTournamentInvitations } from "../../tournaments/hooks/useMyTournamentInvitations";

export function ProfilePage() {
  const { t } = useTranslation();
  const { isAdmin, profile } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useProfileStats(
    profile?.id
  );
  const {
    insights,
    loading: insightsLoading,
    error: insightsError,
    selectedFilter,
    setSelectedFilter,
  } = useProfileCompetitiveInsights(profile?.id, profile?.competitiveRating);
  const {
    pendingInvitations,
    loading: invitationsLoading,
    error: invitationsError,
  } = useMyEventInvitations(profile?.id);
  const {
    pendingInvitations: pendingTournamentInvitations,
    loading: tournamentInvitationsLoading,
    error: tournamentInvitationsError,
  } = useMyTournamentInvitations(profile?.id);
  const {
    activeRequests: myJoinRequests,
    loading: joinRequestsLoading,
    error: joinRequestsError,
  } = useMyEventJoinRequests(profile?.id);

  const { pastEvents } = useProfileEvents(profile?.id);
  const attendedOpenPlayCount = pastEvents.filter(
    (event) => event.type === "open_play"
  ).length;
  if (!profile) {
    return <p className="text-slate-500">{t("profile.loading")}</p>;
  }

  return (
    <section className="space-y-5 sm:space-y-6 md:space-y-8">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_42%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(255,255,255,1)_100%)] p-5 sm:p-6 md:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-black text-white ring-4 ring-white shadow-md">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                {profile.fullName}
              </h1>

              <p className="mt-1 text-sm text-slate-500">{profile.email}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start">
                <ProfileBadge className="border-blue-200 bg-blue-50 text-blue-700">
                  <Trophy size={15} />
                  {formatCompetitiveRating(profile.competitiveRating)}
                </ProfileBadge>

                <ProfileBadge className="border-slate-200 bg-white text-slate-700">
                  <Shield size={15} />
                  {t(`roles.${profile.role}`)}
                </ProfileBadge>

                {profile.country && (
                  <ProfileBadge className="border-slate-200 bg-white text-slate-600">
                    <MapPin size={15} />
                    {profile.city ? `${profile.city}, ${profile.country}` : profile.country}
                  </ProfileBadge>
                )}

                {attendedOpenPlayCount > 0 && (
                  <ProfileBadge className="border-amber-200 bg-amber-50 text-amber-700">
                    <Users size={15} />
                    {t("profile.attendedOpenPlay", {
                      count: attendedOpenPlayCount,
                    })}
                  </ProfileBadge>
                )}

                {profile.hasBall && (
                  <ProfileBadge
                    className="border-emerald-200 bg-emerald-50 px-2.5 text-emerald-700"
                    title={t("profile.ballVerified")}
                  >
                    <Volleyball size={15} />
                  </ProfileBadge>
                )}

                {profile.hasNet && (
                  <ProfileBadge
                    className="border-violet-200 bg-violet-50 px-2.5 text-violet-700"
                    title={t("profile.netVerified")}
                  >
                    <Rows2 size={15} />
                  </ProfileBadge>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <ProfileStatsCard stats={stats} loading={statsLoading} />

      {statsError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {statsError}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
        <PlayerPreferencesSection profile={profile} />

        <RecentMatchesSection
          matches={stats.recentMatches}
          loading={statsLoading}
        />
      </div>

      <PremiumHistorySection
        userId={profile.id}
        insights={insights}
        loading={insightsLoading}
        error={insightsError}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <MyEventJoinRequestsSection
          requests={myJoinRequests}
          loading={joinRequestsLoading}
          error={joinRequestsError}
        />

        <MyEventInvitationsSection
          eventInvitations={pendingInvitations}
          tournamentInvitations={pendingTournamentInvitations}
          loading={invitationsLoading || tournamentInvitationsLoading}
          error={invitationsError || tournamentInvitationsError}
        />
      </div>

      {isAdmin && (
        <div className="rounded-[2rem] bg-slate-900 p-5 text-white shadow-sm sm:p-6 md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-300">
            {t("profile.adminEyebrow")}
          </p>

          <h2 className="mt-3 text-2xl font-bold">{t("profile.adminTitle")}</h2>

          <p className="mt-2 text-slate-300">
            {t("profile.adminBody")}
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Link
              to="/stats"
              className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
            >
              <BarChart3 />
              <h3 className="mt-4 font-bold">{t("profile.statistics")}</h3>
              <p className="mt-2 text-sm text-slate-300">
                {t("profile.statisticsBody")}
              </p>
            </Link>

            <Link
              to="/admin/users"
              className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
            >
              <Users />
              <h3 className="mt-4 font-bold">{t("profile.manageUsers")}</h3>
              <p className="mt-2 text-sm text-slate-300">
                {t("profile.manageUsersBody")}
              </p>
            </Link>

            <Link
              to="/admin/events"
              className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
            >
              <Trophy />
              <h3 className="mt-4 font-bold">{t("profile.manageEvents")}</h3>
              <p className="mt-2 text-sm text-slate-300">
                {t("profile.manageEventsBody")}
              </p>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function ProfileBadge({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
