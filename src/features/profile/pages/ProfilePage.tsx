import {
  BarChart3,
  CalendarDays,
  Mail,
  Shield,
  Trophy,
  Users,
  MapPin,
  Settings,
  Volleyball,
  Rows2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import { useProfileEvents } from "../hooks/useProfileEvents";
import { useProfileCompetitiveInsights } from "../hooks/useProfileCompetitiveInsights";
import { useProfileStats } from "../hooks/useProfileStats";
import { CompetitiveInsightsSection } from "../components/CompetitiveInsightsSection";
import { ProfileStatsCard } from "../components/ProfileStatsCard";
import { RecentMatchesList } from "../components/RecentMatchesList";
import { useMyEventInvitations } from "../../event-invitations/hooks/useMyEventInvitations";
import { MyEventInvitationsSection } from "../../event-invitations/components/MyEventInvitationsSection";
import { useCreatedEvents } from "../hooks/useCreatedEvents";
import { CreatedEventsSection } from "../components/CreatedEventsSection";
import { useMyEventJoinRequests } from "../../event-join-requests/hooks/useMyEventJoinRequests";
import { MyEventJoinRequestsSection } from "../../event-join-requests/components/MyEventJoinRequestsSection";
import type { Event } from "../../events/types/event.types";
import {
  getEventBadgeClasses,
  getEventDisplayStatus,
  getEventModeLabel,
  getEventTypeLabel,
  getEventVisibilityBadgeClasses,
  getEventVisibilityLabel,
} from "../../events/utils/event-display.utils";

export function ProfilePage() {
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
  } = useProfileCompetitiveInsights(profile?.id);
  const {
    pendingInvitations,
    loading: invitationsLoading,
    error: invitationsError,
  } = useMyEventInvitations(profile?.id);
  const {
    events: createdEvents,
    loading: createdEventsLoading,
    error: createdEventsError,
  } = useCreatedEvents(profile?.id);
  const {
    activeRequests: myJoinRequests,
    loading: joinRequestsLoading,
    error: joinRequestsError,
  } = useMyEventJoinRequests(profile?.id);

  const {
    upcomingEvents,
    // pastEvents,
    loading,
    error,
  } = useProfileEvents(profile?.id);
  if (!profile) {
    return <p className="text-slate-500">Loading profile...</p>;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-row justify-between">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-black text-white">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">
              {profile.fullName}
            </h1>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <Mail size={15} />
                {profile.email}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 font-semibold capitalize text-blue-700">
                <Shield size={15} />
                {profile.role}
              </span>

              {profile.country && (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                  <MapPin size={15} />
                  {profile.city ? `${profile.city}, ${profile.country}` : profile.country}
                </span>
              )}

                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  <Trophy size={15} />
                {formatCompetitiveRating(insights.currentRating)} rating
              </span>

              {profile.hasBall && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                  <Volleyball size={15} />
                  Ball verified
                </span>
              )}

              {profile.hasNet && (
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                  <Rows2 size={15} />
                  Net verified
                </span>
              )}

            </div>
          </div>

          <Link
            to="/settings"
            className="hidden shrink-0 items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white md:inline-flex"
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>
      </div>

      <ProfileStatsCard stats={stats} loading={statsLoading} />

      {statsError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {statsError}
        </p>
      )}

      <CompetitiveInsightsSection
        insights={insights}
        loading={insightsLoading}
        error={insightsError}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      <CreatedEventsSection
        events={createdEvents}
        loading={createdEventsLoading}
        error={createdEventsError}
      />

      <RecentMatchesList matches={stats.recentMatches} loading={statsLoading} />

      <MyEventJoinRequestsSection
        requests={myJoinRequests}
        loading={joinRequestsLoading}
        error={joinRequestsError}
      />

      <MyEventInvitationsSection
        invitations={pendingInvitations}
        loading={invitationsLoading}
        error={invitationsError}
      />

      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming events</h2>
          </div>

          <Link to="/events" className="text-sm font-bold text-blue-600 bg-blue-200 hover:bg-blue-600 hover:text-white p-2 rounded-xl">
            Explore more
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Loading your events...</p>
        )}

        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && upcomingEvents.length === 0 && (
          <div className="rounded-3xl bg-slate-50 p-6 text-center">
            <p className="font-bold text-slate-900">No joined events yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Join a match or open play session and it will appear here.
            </p>
          </div>
        )}

        {!loading && !error && upcomingEvents.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <ProfileEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>



      {isAdmin && (
        <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-300">
            Admin area
          </p>

          <h2 className="mt-3 text-2xl font-bold">Management tools</h2>

          <p className="mt-2 text-slate-300">
            Access internal dashboards to manage users, events and platform
            statistics.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link
              to="/stats"
              className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
            >
              <BarChart3 />
              <h3 className="mt-4 font-bold">Statistics</h3>
              <p className="mt-2 text-sm text-slate-300">
                View platform analytics.
              </p>
            </Link>

            <Link
              to="/admin/users"
              className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
            >
              <Users />
              <h3 className="mt-4 font-bold">Manage users</h3>
              <p className="mt-2 text-sm text-slate-300">
                Review registered users.
              </p>
            </Link>

            <Link
              to="/admin/events"
              className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
            >
              <Trophy />
              <h3 className="mt-4 font-bold">Manage events</h3>
              <p className="mt-2 text-sm text-slate-300">
                Control all platform events.
              </p>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function ProfileEventCard({
  event,
}: {
  event: Event;
}) {
  const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;

  return (
    <Link
      to={`/events/${event.id}`}
      className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:bg-blue-50"
    >
      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
            event
          )}`}
        >
          {getEventTypeLabel(event.type)}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventVisibilityBadgeClasses(
            event.visibility
          )}`}
        >
          {getEventVisibilityLabel(event.visibility)}
        </span>

        {modeLabel && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {modeLabel}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-bold text-slate-900">{event.title}</h3>

      <div className="mt-3 space-y-2 text-sm text-slate-500">
        <p className="flex items-center gap-2">
          <CalendarDays size={16} />
          {new Date(event.startDate).toLocaleString()}
        </p>

        <p className="flex items-center gap-2">
          <MapPin size={16} />
          {event.locationName}
        </p>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {getEventDisplayStatus(event)}
      </p>
    </Link>
  );
}
