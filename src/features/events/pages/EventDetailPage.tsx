import {
  CalendarDays,
  Clock3,
  Copy,
  Info,
  MapPin,
  Navigation,
  Shield,
  UserCircle2,
  Users,
} from "lucide-react";
import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useEventInvitations } from "../../event-invitations/hooks/useEventInvitations";
import { useEventJoinRequests } from "../../event-join-requests/hooks/useEventJoinRequests";
import { useMatchPlayers } from "../../match-players/hooks/useMatchPlayers";
import { useMatchResult } from "../../match-results/hooks/useMatchResult";
import {
  getEventParticipants,
  registerToEvent,
  unregisterFromEvent,
  type EventParticipant,
} from "../../registrations/services/registrations.service";
import { getEventDetailSummary } from "../services/events.service";
import { isUnlimitedEventCapacity } from "../types/event.types";
import type { Event } from "../types/event.types";
import {
  getEventBadgeClasses,
  getEventDisplayStatus,
  getEventFallbackImage,
  getEventModeBadgeClasses,
  getEventModeLabel,
  getEventTypeLabel,
  getEventVisibilityBadgeClasses,
  getEventVisibilityLabel,
  isPastEvent,
} from "../utils/event-display.utils";

const EventLocationMap = lazy(() =>
  import("../components/EventLocationMap").then((module) => ({
    default: module.EventLocationMap,
  }))
);
const MatchResultSection = lazy(() =>
  import("../../match-results/components/MatchResultSection").then((module) => ({
    default: module.MatchResultSection,
  }))
);
const EventInvitationResponseCard = lazy(() =>
  import("../../event-invitations/components/EventInvitationResponseCard").then(
    (module) => ({
      default: module.EventInvitationResponseCard,
    })
  )
);
const MatchPlayersSection = lazy(() =>
  import("../../match-players/components/MatchPlayersSection").then((module) => ({
    default: module.MatchPlayersSection,
  }))
);
const EventJoinRequestSection = lazy(() =>
  import("../../event-join-requests/components/EventJoinRequestSection").then(
    (module) => ({
      default: module.EventJoinRequestSection,
    })
  )
);
const PrivateEventAccessCard = lazy(() =>
  import("../../event-join-requests/components/PrivateEventAccessCard").then(
    (module) => ({
      default: module.PrivateEventAccessCard,
    })
  )
);

function formatEventDate(dateValue: string) {
  if (!dateValue) {
    return "Date pending";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date pending";
  }

  return parsedDate.toLocaleString();
}

function formatEventDateLabel(dateValue: string) {
  if (!dateValue) {
    return "Date pending";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date pending";
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatEventTimeLabel(dateValue: string) {
  if (!dateValue) {
    return "Time pending";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Time pending";
  }

  return parsedDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEventHighlights(event: Event) {
  if (event.type === "tournament") {
    return [
      "Structured day built for bigger attendance and more competitive rhythm.",
      "Ideal for brackets, community milestones, and featured beach events.",
      "Share the event early so players can secure spots before it fills up.",
    ];
  }

  if (event.type === "open_play") {
    return [
      "Relaxed open session focused on meeting players and getting quality reps in.",
      "Flexible attendance makes it easier for the local community to join.",
      "Great for partner rotations, casual games, and social beach sessions.",
    ];
  }

  if (event.mode === "competitive") {
    return [
      "Accepted results feed into competitive rating and player history.",
      "Rosters stay focused on four active players with clearer team structure.",
      "Best for more serious matches with stronger level expectations.",
    ];
  }

  return [
    "Casual format designed for smooth games and an easy-going beach session.",
    "Perfect for practice matches, friend meetups, and quick local games.",
    "Results stay social only, so there is no rating impact here.",
  ];
}

export function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile, isAdmin } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [registeredParticipants, setRegisteredParticipants] = useState<EventParticipant[]>([]);
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [creatorName, setCreatorName] = useState<string | null>(null);

  const canEdit = Boolean(
    profile && event && (profile.id === event.createdBy || isAdmin)
  );

  const canCopyPrivateLink = Boolean(
    event &&
      event.visibility === "private" &&
      profile &&
      (profile.id === event.createdBy || isAdmin)
  );

  const hasUnlimitedSpots = Boolean(
    event &&
      event.type !== "match" &&
      isUnlimitedEventCapacity(event.maxParticipants)
  );
  const isFull = event
    ? !hasUnlimitedSpots && registrationsCount >= event.maxParticipants
    : false;
  const isPast = event ? isPastEvent(event) : false;
  const isClosedEvent = Boolean(
    event &&
      (event.status === "completed" || event.status === "cancelled" || isPast)
  );
  const canViewMatchPlayers = Boolean(
    event &&
      event.type === "match" &&
      (event.visibility === "public" || canEdit || alreadyJoined)
  );
  const canViewParticipants = Boolean(
    event && (event.visibility === "public" || canEdit || alreadyJoined)
  );

  const matchPlayers = useMatchPlayers(eventId, {
    eventType: canViewMatchPlayers ? event?.type : undefined,
    currentUserId: profile?.id,
    isManager: canEdit,
  });

  const isMatchEvent = event?.type === "match";
  const displayJoinedCount =
    isMatchEvent && canViewMatchPlayers
      ? matchPlayers.state.activePlayers.length
      : registrationsCount;
  const displayAlreadyJoined =
    isMatchEvent && canViewMatchPlayers
      ? Boolean(matchPlayers.state.currentPlayer)
      : alreadyJoined;
  const displayIsFull =
    isMatchEvent && canViewMatchPlayers
      ? matchPlayers.state.isFull
      : isFull;
  const isMatchMembershipUpdating = Boolean(
    matchPlayers.state.actionLoadingId &&
      profile &&
      (matchPlayers.state.actionLoadingId === `join:${profile.id}` ||
        matchPlayers.state.actionLoadingId === `leave:${profile.id}`)
  );
  const matchResult = useMatchResult(eventId, {
    eventType: event?.type,
    eventMode: event?.mode ?? null,
    currentUserId: profile?.id,
    isEventManager: canEdit && !isClosedEvent,
    canCheckValidationEligibility:
      !isClosedEvent &&
      (event?.visibility !== "private" || canEdit || alreadyJoined),
    validationContextKey: matchPlayers.state.activePlayers
      .map((player) => `${player.userId}:${player.team}:${player.status}`)
      .join("|"),
  });
  const isAcceptedMatch =
    event?.type === "match" &&
    matchResult.matchResult?.validationStatus === "accepted";

  const eventInvitations = useEventInvitations(eventId, {
    currentUserId: profile?.id,
    canManageInvitations: false,
  });

  const eventJoinRequests = useEventJoinRequests(eventId, {
    currentUserId: profile?.id,
    canManageRequests: Boolean(event?.visibility === "private" && canEdit),
  });

  async function loadEventSummary(currentEventId: string) {
    const summary = await getEventDetailSummary(currentEventId);
    setEvent(summary.event);
    setCreatorName(summary.creatorName);
    setRegistrationsCount(summary.registrationsCount);
    setAlreadyJoined(summary.isRegistered);
  }

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return;

      try {
        setLoading(true);
        setError("");
        await loadEventSummary(eventId);
      } catch (err) {
        console.error(err);
        setError("Could not load event");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId, profile?.id]);

  useEffect(() => {
    async function loadParticipants() {
      if (!eventId || !event || event.type === "match" || !canViewParticipants) {
        setRegisteredParticipants([]);
        setParticipantsLoading(false);
        return;
      }

      try {
        setParticipantsLoading(true);
        const data = await getEventParticipants(eventId);
        setRegisteredParticipants(data);
      } catch (err) {
        console.error(err);
        setRegisteredParticipants([]);
      } finally {
        setParticipantsLoading(false);
      }
    }

    loadParticipants();
  }, [canViewParticipants, event, eventId]);

  async function handleJoinEvent() {
    if (!eventId) return;

    if (!isAuthenticated || !profile) {
      navigate(`/login?redirect=/events/${eventId}`);
      return;
    }

    if (displayAlreadyJoined || displayIsFull) {
      return;
    }

    try {
      if (event?.type === "match") {
        await matchPlayers.actions.join();
        return;
      }

      setJoining(true);
      setError("");
      await registerToEvent(eventId, profile.id);
      await loadEventSummary(eventId);
    } catch (err) {
      console.error(err);
      setError("Could not join this event");
    } finally {
      setJoining(false);
    }
  }

  async function handleLeaveEvent() {
    if (!eventId || !profile) return;

    try {
      if (event?.type === "match") {
        await matchPlayers.actions.leave();
        return;
      }

      setJoining(true);
      setError("");
      await unregisterFromEvent(eventId, profile.id);
      await loadEventSummary(eventId);
    } catch (err) {
      console.error(err);
      setError("Could not leave this event");
    } finally {
      setJoining(false);
    }
  }

  async function handleCopyPrivateLink() {
    if (!event) return;

    const privateUrl = `${window.location.origin}/events/${event.id}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(privateUrl);
        setCopyMessage("Private link copied");
        return;
      }

      setCopyMessage("Copy not available on this device");
    } catch (err) {
      console.error(err);
      setCopyMessage("Could not copy private link");
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading event...</p>;
  }

  if (error && !event) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Event not found</h1>
        <p className="mt-2 text-slate-500">{error}</p>
        <Link to="/events" className="mt-4 inline-block text-blue-600">
          Back to events
        </Link>
      </section>
    );
  }

  if (!event) return null;

  const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;
  const displayStatus = getEventDisplayStatus(event);
  const shouldShowJoinButton =
    !isAcceptedMatch &&
    !displayAlreadyJoined &&
    (!(event.visibility === "private" && !canEdit) || isClosedEvent);
  const participants =
    event.type === "match"
      ? matchPlayers.state.activePlayers.map((player) => ({
          id: player.id,
          userId: player.userId,
          profile: {
            id: player.profile.id,
            fullName: player.profile.fullName,
            avatarUrl: player.profile.avatarUrl,
            country: null,
          },
        }))
      : registeredParticipants;
  const visibleParticipants = showAllParticipants
    ? participants
    : participants.slice(0, 5);
  const spotsLeft = hasUnlimitedSpots
    ? null
    : Math.max(event.maxParticipants - displayJoinedCount, 0);
  const directionsUrl =
    Number.isFinite(event.latitude) && Number.isFinite(event.longitude)
      ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
      : null;
  const eventHighlights = getEventHighlights(event);
  const shouldShowParticipantsCard =
    canViewParticipants && (participantsLoading || participants.length > 0);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-sm">
        <div
          className="relative min-h-[290px] bg-cover bg-center px-6 py-6 sm:px-8 sm:py-8"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.22) 0%, rgba(2,6,23,0.8) 78%), url('${getEventFallbackImage(
              event
            )}')`,
          }}
        >
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                  event
                )}`}
              >
                {getEventTypeLabel(event.type)}
              </span>

              {modeLabel ? (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventModeBadgeClasses(
                    event.mode
                  )}`}
                >
                  {modeLabel}
                </span>
              ) : null}

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventVisibilityBadgeClasses(
                  event.visibility
                )}`}
              >
                {getEventVisibilityLabel(event.visibility)}
              </span>

              {displayStatus !== "Active" ? (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase text-white backdrop-blur">
                  {displayStatus}
                </span>
              ) : null}
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-black text-white sm:text-4xl">
                {event.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                {event.description || "No description provided yet for this event."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <EventDetailStatCard
          icon={<CalendarDays size={18} className="text-blue-600" />}
          label="Date"
          value={formatEventDateLabel(event.startDate)}
        />
        <EventDetailStatCard
          icon={<Clock3 size={18} className="text-blue-600" />}
          label="Start time"
          value={formatEventTimeLabel(event.startDate)}
        />
        <EventDetailStatCard
          icon={<MapPin size={18} className="text-blue-600" />}
          label="Location"
          value={event.locationName || "Location pending"}
        />
        <EventDetailStatCard
          icon={<Users size={18} className="text-blue-600" />}
          label="Joined"
          value={
            hasUnlimitedSpots
              ? `${displayJoinedCount} joined`
              : `${displayJoinedCount} / ${event.maxParticipants}`
          }
          helper={
            hasUnlimitedSpots
              ? "Unlimited spots"
              : spotsLeft && spotsLeft > 0
                ? `${spotsLeft} spots left`
                : "Event full"
          }
        />
      </div>

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900">
                <Info size={18} className="text-blue-600" />
                <h2 className="text-lg font-black">About this event</h2>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {event.description ||
                  "No extra notes yet. Use the summary cards and participants section to understand the event at a glance."}
              </p>

              <div className="mt-5 space-y-3">
                {eventHighlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {shouldShowParticipantsCard ? (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Participants
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {participants.length} joined
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                    {hasUnlimitedSpots
                      ? "Unlimited"
                      : spotsLeft && spotsLeft > 0
                        ? `${spotsLeft} spots left`
                        : "Full"}
                  </span>
                </div>

                {participantsLoading ? (
                  <div className="mt-5 space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-14 animate-pulse rounded-2xl bg-slate-100"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="mt-5 space-y-3">
                      {visibleParticipants.map((participant) => (
                        <ParticipantRow
                          key={participant.id}
                          participant={participant}
                        />
                      ))}
                    </div>

                    {participants.length > 5 ? (
                      <button
                        type="button"
                        onClick={() => setShowAllParticipants((current) => !current)}
                        className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                      >
                        {showAllParticipants
                          ? "Show fewer participants"
                          : `View all ${participants.length} participants`}
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Court location</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {event.locationName || "Location pending"}
                </p>
              </div>

              {directionsUrl ? (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  <Navigation size={16} />
                  Get directions
                </a>
              ) : null}
            </div>

            <div className="mt-5 h-72 overflow-hidden rounded-2xl bg-slate-100">
              <Suspense fallback={<SectionLoadingMessage message="Loading map..." />}>
                <EventLocationMap
                  latitude={event.latitude}
                  longitude={event.longitude}
                  title={event.title}
                  locationName={event.locationName}
                />
              </Suspense>
            </div>
          </div>

          {event.type === "match" && canViewMatchPlayers ? (
            <Suspense fallback={<SectionLoadingMessage message="Loading teams..." />}>
              <MatchPlayersSection
                teamAPlayers={matchPlayers.state.teamAPlayers}
                teamBPlayers={matchPlayers.state.teamBPlayers}
                loading={matchPlayers.state.loading}
                actionLoadingId={matchPlayers.state.actionLoadingId}
                error={matchPlayers.state.error}
                isManager={matchPlayers.state.isManager && !isAcceptedMatch && !isClosedEvent}
                currentUserId={profile?.id}
                onAssignTeam={matchPlayers.actions.assignTeam}
                onRemove={matchPlayers.actions.remove}
              />
            </Suspense>
          ) : null}

          {event.type === "match" ? (
            <Suspense fallback={<SectionLoadingMessage message="Loading result..." />}>
              <MatchResultSection
                result={matchResult.matchResult}
                sets={matchResult.sets}
                eventMode={event.mode ?? null}
                isCompetitiveFixedSets={matchResult.isCompetitiveFixedSets}
                loading={matchResult.loading}
                submitting={matchResult.submitting}
                validating={matchResult.validating}
                error={matchResult.error}
                canManageResult={matchResult.canManageResult}
                canValidateResult={matchResult.canValidateResult}
                onAddSet={matchResult.addSet}
                onRemoveSet={matchResult.removeSet}
                onUpdateSet={matchResult.updateSet}
                onSubmit={matchResult.submitResult}
                onValidate={matchResult.validateResult}
                onReject={matchResult.rejectResult}
              />
            </Suspense>
          ) : null}

          {event.visibility === "private" &&
          !isClosedEvent &&
          eventInvitations.state.pendingInvitationForCurrentUser ? (
            <Suspense fallback={<SectionLoadingMessage message="Loading invitation..." />}>
              <EventInvitationResponseCard
                invitation={eventInvitations.state.pendingInvitationForCurrentUser}
                actionLoadingId={eventInvitations.state.actionLoadingId}
                onAccept={eventInvitations.actions.acceptInvitation}
                onDecline={eventInvitations.actions.declineInvitation}
              />
            </Suspense>
          ) : null}

          {event.visibility === "private" &&
          canEdit &&
          !displayIsFull &&
          !isAcceptedMatch &&
          !isClosedEvent ? (
            <Suspense fallback={<SectionLoadingMessage message="Loading requests..." />}>
              <EventJoinRequestSection
                requests={eventJoinRequests.state.pendingRequests}
                actionLoadingId={eventJoinRequests.state.actionLoadingId}
                onAccept={eventJoinRequests.actions.acceptRequest}
                onReject={eventJoinRequests.actions.rejectRequest}
              />
            </Suspense>
          ) : null}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Event snapshot
            </p>

            <div className="mt-4 space-y-3">
              <SidebarInfoRow
                label="Starts"
                value={formatEventDate(event.startDate)}
                icon={<CalendarDays size={16} className="text-blue-600" />}
              />
              <SidebarInfoRow
                label="Created by"
                value={creatorName || "Loading creator..."}
                icon={<UserCircle2 size={16} className="text-blue-600" />}
              />
              <SidebarInfoRow
                label="Visibility"
                value={getEventVisibilityLabel(event.visibility)}
                icon={<Shield size={16} className="text-blue-600" />}
              />
              <SidebarInfoRow
                label="Location"
                value={event.locationName || "Location pending"}
                icon={<MapPin size={16} className="text-blue-600" />}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Availability
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {hasUnlimitedSpots ? "∞" : spotsLeft}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {hasUnlimitedSpots
                  ? "no participant limit"
                  : `spots left out of ${event.maxParticipants}`}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {shouldShowJoinButton ? (
                <button
                  onClick={isClosedEvent ? undefined : handleJoinEvent}
                  disabled={
                    isClosedEvent ||
                    joining ||
                    isMatchMembershipUpdating ||
                    displayIsFull ||
                    isPast ||
                    matchPlayers.state.loading
                  }
                  className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isClosedEvent
                    ? "Event Finished"
                    : displayIsFull
                      ? "Event Full"
                      : joining || isMatchMembershipUpdating
                        ? "Joining..."
                        : "Join Event"}
                </button>
              ) : !isAcceptedMatch && !isClosedEvent && displayAlreadyJoined ? (
                <button
                  onClick={handleLeaveEvent}
                  disabled={joining || isMatchMembershipUpdating || matchPlayers.state.loading}
                  className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600 disabled:opacity-60"
                >
                  {joining || isMatchMembershipUpdating ? "Leaving..." : "Leave Event"}
                </button>
              ) : null}

              {canEdit && !isAcceptedMatch && !isClosedEvent ? (
                <Link
                  to={`/events/${event.id}/edit`}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-center font-bold text-slate-700"
                >
                  Edit Event
                </Link>
              ) : null}

              {canCopyPrivateLink ? (
                <button
                  type="button"
                  onClick={handleCopyPrivateLink}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white"
                >
                  <Copy size={16} />
                  Copy Private Link
                </button>
              ) : null}
            </div>

            {copyMessage ? (
              <p className="mt-4 text-sm font-medium text-slate-600">
                {copyMessage}
              </p>
            ) : null}
          </div>

          {event.visibility === "private" &&
          !canEdit &&
          !displayAlreadyJoined &&
          !isClosedEvent &&
          !isAcceptedMatch ? (
            <Suspense fallback={<SectionLoadingMessage message="Loading access..." />}>
              <PrivateEventAccessCard
                request={eventJoinRequests.state.myRequest}
                actionLoadingId={eventJoinRequests.state.actionLoadingId}
                onRequestAccess={eventJoinRequests.actions.requestAccess}
              />
            </Suspense>
          ) : null}
        </aside>
      </section>
    </section>
  );
}

function EventDetailStatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">{icon}</div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-black text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

function ParticipantRow({ participant }: { participant: EventParticipant }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      {participant.profile.avatarUrl ? (
        <img
          src={participant.profile.avatarUrl}
          alt={participant.profile.fullName}
          className="h-11 w-11 rounded-2xl object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
          {participant.profile.fullName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">
          {participant.profile.fullName}
        </p>
        <p className="truncate text-xs text-slate-500">
          {participant.profile.country || "Beach volleyball player"}
        </p>
      </div>
    </div>
  );
}

function SidebarInfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function SectionLoadingMessage({ message }: { message: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm">
      {message}
    </div>
  );
}
