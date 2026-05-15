import { CalendarDays, Copy, MapPin, UserCircle2, Users } from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import {
  registerToEvent,
  unregisterFromEvent,
} from "../../registrations/services/registrations.service";
import { getEventDetailSummary } from "../services/events.service";
import type { Event } from "../types/event.types";
import {
  getEventBadgeClasses,
  getEventDisplayStatus,
  getEventModeLabel,
  getEventTypeLabel,
  getEventVisibilityBadgeClasses,
  getEventVisibilityLabel,
  isPastEvent,
} from "../utils/event-display.utils";
import { useMatchResult } from "../../match-results/hooks/useMatchResult";
import { useEventInvitations } from "../../event-invitations/hooks/useEventInvitations";
import { useMatchPlayers } from "../../match-players/hooks/useMatchPlayers";
import { useEventJoinRequests } from "../../event-join-requests/hooks/useEventJoinRequests";

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

export function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile, isAdmin } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
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

  const isFull = event
    ? registrationsCount >= event.maxParticipants
    : false;

  const isPast = event ? isPastEvent(event) : false;
  const canViewMatchPlayers = Boolean(
    event &&
      event.type === "match" &&
      (event.visibility === "public" || canEdit || alreadyJoined)
  );

  const matchPlayers = useMatchPlayers(eventId, {
    eventType: canViewMatchPlayers ? event?.type : undefined,
    currentUserId: profile?.id,
    isManager: canEdit,
  });

  const isMatchEvent = event?.type === "match";
  const displayJoinedCount = isMatchEvent && canViewMatchPlayers
    ? matchPlayers.state.activePlayers.length
    : registrationsCount;
  const displayAlreadyJoined = isMatchEvent && canViewMatchPlayers
    ? Boolean(matchPlayers.state.currentPlayer)
    : alreadyJoined;
  const displayIsFull = isMatchEvent && canViewMatchPlayers ? matchPlayers.state.isFull : isFull;
  const isMatchMembershipUpdating = Boolean(
    matchPlayers.state.actionLoadingId &&
      profile &&
      (matchPlayers.state.actionLoadingId === `join:${profile.id}` ||
        matchPlayers.state.actionLoadingId === `leave:${profile.id}`)
  );
  const matchResult = useMatchResult(eventId, {
    eventType: event?.type,
    currentUserId: profile?.id,
    isEventManager: canEdit,
    canCheckValidationEligibility:
      event?.visibility !== "private" || canEdit || alreadyJoined,
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

  async function handleJoinEvent() {
    if (!eventId) return;

    if (!isAuthenticated || !profile) {
      navigate(`/login?redirect=/events/${eventId}`);
      return;
    }

    if (displayAlreadyJoined) {
      return;
    }

    if (displayIsFull) {
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

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                event
              )}`}
            >
              {getEventTypeLabel(event.type)}
            </span>

            {modeLabel && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                {modeLabel}
              </span>
            )}

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventVisibilityBadgeClasses(
                event.visibility
              )}`}
            >
              {getEventVisibilityLabel(event.visibility)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
              {displayStatus}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            {event.title}
          </h1>

          <p className="mt-3 text-slate-600">
            {event.description || "No description provided."}
          </p>

          {error && (
            <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4">
              <CalendarDays size={18} className="text-blue-600" />
              {new Date(event.startDate).toLocaleString()}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4">
              <MapPin size={18} className="text-blue-600" />
              {event.locationName}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4">
              <Users size={18} className="text-blue-600" />
              {displayJoinedCount}/{event.maxParticipants} joined
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              Visibility: {getEventVisibilityLabel(event.visibility)}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              Status: {displayStatus}
            </div>

            {modeLabel && (
              <div className="rounded-2xl bg-slate-50 p-4">
                Mode: {modeLabel}
              </div>
            )}

            <div className="rounded-2xl bg-slate-50 p-4">
              Type: {getEventTypeLabel(event.type)}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4">
              <UserCircle2 size={18} className="text-blue-600" />
              Created by: {creatorName || "Loading creator..."}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {!isAcceptedMatch &&
            !displayAlreadyJoined &&
            !(event.visibility === "private" && !canEdit) ? (
              <button
                onClick={handleJoinEvent}
                disabled={
                  joining ||
                  isMatchMembershipUpdating ||
                  displayIsFull ||
                  isPast ||
                  matchPlayers.state.loading
                }
                className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPast
                  ? "Event Finished"
                  : displayIsFull
                    ? "Event Full"
                    : joining || isMatchMembershipUpdating
                      ? "Joining..."
                      : "Join Event"}
              </button>
            ) : !isAcceptedMatch && displayAlreadyJoined ? (
              <button
                onClick={handleLeaveEvent}
                disabled={joining || isMatchMembershipUpdating || matchPlayers.state.loading}
                className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600 disabled:opacity-60"
              >
                {joining || isMatchMembershipUpdating ? "Leaving..." : "Leave Event"}
              </button>
            ) : null}

            {event.visibility === "private" &&
            !canEdit &&
            !displayAlreadyJoined &&
            !isAcceptedMatch ? (
              <div className="sm:max-w-sm">
                <Suspense fallback={<SectionLoadingMessage message="Loading access..." />}>
                  <PrivateEventAccessCard
                    request={eventJoinRequests.state.myRequest}
                    actionLoadingId={eventJoinRequests.state.actionLoadingId}
                    onRequestAccess={eventJoinRequests.actions.requestAccess}
                  />
                </Suspense>
              </div>
            ) : null}

            {canEdit && !isAcceptedMatch && (
              <Link
                to={`/events/${event.id}/edit`}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-center font-bold text-slate-700"
              >
                Edit Event
              </Link>
            )}

            {canCopyPrivateLink && (
              <button
                type="button"
                onClick={handleCopyPrivateLink}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white"
              >
                <Copy size={16} />
                Copy Private Link
              </button>
            )}
          </div>

          {copyMessage && (
            <p className="mt-4 text-sm font-medium text-slate-600">
              {copyMessage}
            </p>
          )}
        </div>

        {event.type === "match" && canViewMatchPlayers && (
          <Suspense fallback={<SectionLoadingMessage message="Loading teams..." />}>
            <MatchPlayersSection
              teamAPlayers={matchPlayers.state.teamAPlayers}
              teamBPlayers={matchPlayers.state.teamBPlayers}
              loading={matchPlayers.state.loading}
              actionLoadingId={matchPlayers.state.actionLoadingId}
              error={matchPlayers.state.error}
              isManager={matchPlayers.state.isManager && !isAcceptedMatch}
              currentUserId={profile?.id}
              onAssignTeam={matchPlayers.actions.assignTeam}
              onRemove={matchPlayers.actions.remove}
            />
          </Suspense>
        )}

        {event.type === "match" && (
          <Suspense fallback={<SectionLoadingMessage message="Loading result..." />}>
            <MatchResultSection
              result={matchResult.matchResult}
              sets={matchResult.sets}
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
        )}

        {event.visibility === "private" &&
          eventInvitations.state.pendingInvitationForCurrentUser && (
            <Suspense fallback={<SectionLoadingMessage message="Loading invitation..." />}>
              <EventInvitationResponseCard
                invitation={eventInvitations.state.pendingInvitationForCurrentUser}
                actionLoadingId={eventInvitations.state.actionLoadingId}
                onAccept={eventInvitations.actions.acceptInvitation}
                onDecline={eventInvitations.actions.declineInvitation}
              />
            </Suspense>
          )}

        {event.visibility === "private" && canEdit && !displayIsFull && !isAcceptedMatch && (
          <Suspense fallback={<SectionLoadingMessage message="Loading requests..." />}>
            <EventJoinRequestSection
              requests={eventJoinRequests.state.pendingRequests}
              actionLoadingId={eventJoinRequests.state.actionLoadingId}
              onAccept={eventJoinRequests.actions.acceptRequest}
              onReject={eventJoinRequests.actions.rejectRequest}
            />
          </Suspense>
        )}

      </div>

      <aside className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Location</h2>

        <div className="mt-4 h-64 overflow-hidden rounded-2xl bg-slate-100">
          <Suspense fallback={<SectionLoadingMessage message="Loading map..." />}>
            <EventLocationMap
              latitude={event.latitude}
              longitude={event.longitude}
              title={event.title}
              locationName={event.locationName}
            />
          </Suspense>
        </div>
      </aside>
    </section>
  );
}

function SectionLoadingMessage({ message }: { message: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm">
      {message}
    </div>
  );
}
