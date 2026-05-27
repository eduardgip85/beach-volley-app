import {
  ArrowDownToLine,
  CalendarDays,
  Copy,
  Info,
  MapPin,
  Navigation,
  Share2,
  Shield,
  UserCircle2,
} from "lucide-react";
import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { EventChatSection } from "../../event-chat/components/EventChatSection";
import { useEventInvitations } from "../../event-invitations/hooks/useEventInvitations";
import { useEventJoinRequests } from "../../event-join-requests/hooks/useEventJoinRequests";
import { useMatchPlayers } from "../../match-players/hooks/useMatchPlayers";
import { useMatchResult } from "../../match-results/hooks/useMatchResult";
import { TournamentRegistrationSection } from "../../tournaments/components/TournamentRegistrationSection";
import { getTournamentCoordinators } from "../../tournaments/services/tournamentManagement.service";
import { getTournamentEntries } from "../../tournaments/services/tournamentRegistrations.service";
import type { TournamentEntry } from "../../tournaments/types/tournamentRegistration.types";
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
  getEventStatusReason,
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

function formatEventDate(dateValue: string, locale: string, fallback: string) {
  if (!dateValue) {
    return fallback;
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return parsedDate.toLocaleString(locale);
}

function getEventHighlights(event: Event, t: (key: string) => string) {
  if (event.type === "tournament") {
    return [
      t("eventDetail.highlights.tournament1"),
      t("eventDetail.highlights.tournament2"),
      t("eventDetail.highlights.tournament3"),
    ];
  }

  if (event.type === "open_play") {
    return [
      t("eventDetail.highlights.openPlay1"),
      t("eventDetail.highlights.openPlay2"),
      t("eventDetail.highlights.openPlay3"),
    ];
  }

  if (event.mode === "competitive") {
    return [
      t("eventDetail.highlights.competitive1"),
      t("eventDetail.highlights.competitive2"),
      t("eventDetail.highlights.competitive3"),
    ];
  }

  return [
    t("eventDetail.highlights.casual1"),
    t("eventDetail.highlights.casual2"),
    t("eventDetail.highlights.casual3"),
  ];
}

function getTournamentRegistrationLabel(
  registrationType: string,
  t: (key: string) => string
) {
  return registrationType === "individual"
    ? t("eventDetail.tournament.registrationIndividual")
    : t("eventDetail.tournament.registrationTeam");
}

function getTournamentBracketLabel(
  bracketType: string,
  t: (key: string) => string
) {
  switch (bracketType) {
    case "round_robin":
      return t("eventDetail.tournament.bracketRoundRobin");
    case "group_knockout":
      return t("eventDetail.tournament.bracketGroupKnockout");
    case "double_elimination":
      return t("eventDetail.tournament.bracketDoubleElimination");
    default:
      return t("eventDetail.tournament.bracketSingleElimination");
  }
}

function getTournamentStateLabel(state: string, t: (key: string) => string) {
  switch (state) {
    case "open_registration":
      return t("eventDetail.tournament.stateOpenRegistration");
    case "full":
      return t("eventDetail.tournament.stateFull");
    case "bracket_ready":
      return t("eventDetail.tournament.stateBracketReady");
    case "in_progress":
      return t("eventDetail.tournament.stateInProgress");
    case "completed":
      return t("eventDetail.tournament.stateCompleted");
    case "cancelled":
      return t("eventDetail.tournament.stateCancelled");
    default:
      return t("eventDetail.tournament.stateDraft");
  }
}

function getTournamentEntryFeeLabel(
  entryFeeType: string,
  entryFeeAmount: number | null,
  entryFeeCurrency: string,
  locale: string,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  if (entryFeeType !== "paid" || !entryFeeAmount) {
    return t("eventDetail.tournament.entryFeeFree");
  }

  const formattedAmount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: entryFeeCurrency || "EUR",
    maximumFractionDigits: 2,
  }).format(entryFeeAmount);

  return t("eventDetail.tournament.entryFeePaidValue", {
    amount: formattedAmount,
  });
}

export function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, profile, isAdmin } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [registeredParticipants, setRegisteredParticipants] = useState<EventParticipant[]>([]);
  const [tournamentEntries, setTournamentEntries] = useState<TournamentEntry[]>([]);
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [tournamentCoordinators, setTournamentCoordinators] = useState<
    Array<{ id: string; fullName: string; avatarUrl: string | null; country: string | null; competitiveRating: number }>
  >([]);
  const [summaryAnchor, setSummaryAnchor] = useState<HTMLDivElement | null>(null);

  const canEdit = Boolean(
    profile && event && (profile.id === event.createdBy || isAdmin)
  );
  const isTournamentCoordinator = Boolean(
    profile &&
      tournamentCoordinators.some((coordinator) => coordinator.id === profile.id)
  );
  const canManageTournament = canEdit || isTournamentCoordinator;

  const canCopyPrivateLink = Boolean(
    event &&
      event.visibility === "private" &&
      profile &&
      (profile.id === event.createdBy || isAdmin)
  );
  const canShareLink = Boolean(event);

  const hasUnlimitedSpots = Boolean(
    event &&
      event.type !== "match" &&
      isUnlimitedEventCapacity(event.maxParticipants)
  );
  const isFull = event
    ? !hasUnlimitedSpots && registrationsCount >= event.maxParticipants
    : false;
  const isPast = event ? isPastEvent(event) : false;
  const eventStatusReason = event ? getEventStatusReason(event) : "";
  const isClosedEvent = Boolean(
    event &&
      (event.status === "completed" ||
        event.status === "cancelled" ||
        (event.type !== "match" && isPast))
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
  const hasActiveMatchChatAccess = Boolean(
    matchPlayers.state.currentPlayer &&
      (matchPlayers.state.currentPlayer.status === "joined" ||
        matchPlayers.state.currentPlayer.status === "confirmed")
  );

  const eventInvitations = useEventInvitations(eventId, {
    currentUserId: profile?.id,
    canManageInvitations: false,
  });

  const eventJoinRequests = useEventJoinRequests(eventId, {
    currentUserId: profile?.id,
    canManageRequests: Boolean(event?.visibility === "private" && canEdit),
  });

  async function loadTournamentCoordinators(currentEventId: string) {
    const data = await getTournamentCoordinators(currentEventId);
    setTournamentCoordinators(data);
  }

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
        setError(t("eventDetail.loadError"));
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  useEffect(() => {
    async function loadParticipants() {
      if (!eventId || !event || event.type === "match" || event.type === "tournament" || !canViewParticipants) {
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
  }, [canViewParticipants, event?.id, event?.type, eventId]);

  useEffect(() => {
    async function loadTournamentEntries() {
      if (!eventId || !event || event.type !== "tournament" || !canViewParticipants) {
        setTournamentEntries([]);
        return;
      }

      try {
        setParticipantsLoading(true);
        const data = await getTournamentEntries(eventId);
        setTournamentEntries(data);
      } catch (tournamentEntriesError) {
        console.error(tournamentEntriesError);
        setTournamentEntries([]);
      } finally {
        setParticipantsLoading(false);
      }
    }

    void loadTournamentEntries();
  }, [canViewParticipants, event?.id, event?.type, eventId]);

  useEffect(() => {
    async function syncTournamentCoordinators() {
      if (!eventId || !event || event.type !== "tournament") {
        setTournamentCoordinators([]);
        return;
      }

      try {
        await loadTournamentCoordinators(eventId);
      } catch (coordinatorError) {
        console.error(coordinatorError);
        setTournamentCoordinators([]);
      }
    }

    void syncTournamentCoordinators();
  }, [event?.id, event?.type, eventId]);

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
      setError(t("eventDetail.joinError"));
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
      setError(t("eventDetail.leaveError"));
    } finally {
      setJoining(false);
    }
  }

  async function handleRequestPrivateAccess() {
    if (!eventId) return;

    if (!isAuthenticated || !profile) {
      navigate(`/login?redirect=/events/${eventId}`);
      return;
    }

    await eventJoinRequests.actions.requestAccess();
  }

  async function handleCopyPrivateLink() {
    if (!event) return;

    const privateUrl = `${window.location.origin}/events/${event.id}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(privateUrl);
        setCopyMessage(t("eventDetail.copySuccess"));
        return;
      }

      setCopyMessage(t("eventDetail.copyUnavailable"));
    } catch (err) {
      console.error(err);
      setCopyMessage(t("eventDetail.copyError"));
    }
  }

  async function handleShareLink() {
    if (!event) return;

    const privateUrl = `${window.location.origin}/events/${event.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: t("eventDetail.shareText"),
          url: privateUrl,
        });
        setCopyMessage(t("eventDetail.shareSuccess"));
        return;
      }

      await handleCopyPrivateLink();
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "name" in err &&
        err.name === "AbortError"
      ) {
        return;
      }

      console.error(err);
      setCopyMessage(t("eventDetail.shareError"));
    }
  }

  if (loading) {
    return <p className="text-slate-500">{t("eventDetail.loading")}</p>;
  }

  if (error && !event) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{t("eventDetail.notFoundTitle")}</h1>
        <p className="mt-2 text-slate-500">{error}</p>
        <Link to="/events" className="mt-4 inline-block text-blue-600">
          {t("eventDetail.backToEvents")}
        </Link>
      </section>
    );
  }

  if (!event) return null;

  const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;
  const displayStatus = getEventDisplayStatus(event);
  const shouldShowJoinButton =
    event.type !== "tournament" &&
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
  const tournamentSettings = event.tournamentSettings;
  const tournamentTeams = tournamentEntries.filter((entry) => {
    if (entry.status !== "confirmed") {
      return false;
    }

    if (tournamentSettings?.registrationType === "individual") {
      return entry.entryKind === "balanced_team";
    }

    return entry.entryKind === "registration";
  });
  const visibleParticipants = showAllParticipants
    ? participants
    : participants.slice(0, 5);
  const visibleTournamentTeams = showAllParticipants
    ? tournamentTeams
    : tournamentTeams.slice(0, 5);
  const canAccessEventChat = Boolean(
    profile &&
      !isClosedEvent &&
      event.type !== "tournament" &&
      (event.type === "match" ? hasActiveMatchChatAccess : alreadyJoined)
  );
  const spotsLeft = hasUnlimitedSpots
    ? null
    : Math.max(event.maxParticipants - displayJoinedCount, 0);
  const directionsUrl =
    Number.isFinite(event.latitude) && Number.isFinite(event.longitude)
      ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
      : null;
  const eventHighlights = getEventHighlights(event, t);
  const shouldShowParticipantsCard =
    canViewParticipants &&
    (participantsLoading ||
      (event.type === "tournament"
        ? tournamentTeams.length > 0
        : participants.length > 0));

  function scrollToSummary() {
    summaryAnchor?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

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

              {displayStatus !== t("eventStatus.active") ? (
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
                {event.description || t("eventDetail.noDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {eventStatusReason ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {eventStatusReason}
        </p>
      ) : null}

      <div className="md:hidden">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-black text-slate-900">
                  {t("eventDetail.courtLocation")}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {event.locationName || t("eventDetail.locationPending")}
                </p>
              </div>

              {directionsUrl ? (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                  aria-label={t("eventDetail.getDirections")}
                  title={t("eventDetail.getDirections")}
                >
                  <Navigation size={16} />
                </a>
              ) : null}
            </div>

            <div className="h-52 overflow-hidden rounded-2xl bg-slate-100">
              <Suspense fallback={<SectionLoadingMessage message={t("eventDetail.loadingMap")} />}>
                <EventLocationMap
                  latitude={event.latitude}
                  longitude={event.longitude}
                  title={event.title}
                  locationName={event.locationName}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900">
                <Info size={18} className="text-blue-600" />
                <h2 className="text-lg font-black">{t("eventDetail.aboutTitle")}</h2>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {event.description ||
                  t("eventDetail.aboutFallback")}
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

            {event.type === "tournament" && tournamentSettings ? (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <Shield size={18} className="text-blue-600" />
                  <h2 className="text-lg font-black">
                    {t("eventDetail.tournament.title")}
                  </h2>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {t("eventDetail.tournament.body")}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <TournamentConfigCard
                    label={t("eventDetail.tournament.registrationLabel")}
                    value={getTournamentRegistrationLabel(
                      tournamentSettings.registrationType,
                      t
                    )}
                  />
                  <TournamentConfigCard
                    label={t("eventDetail.tournament.formatLabel")}
                    value={tournamentSettings.teamFormat.toUpperCase()}
                  />
                  <TournamentConfigCard
                    label={t("eventDetail.tournament.entryFeeLabel")}
                    value={getTournamentEntryFeeLabel(
                      tournamentSettings.entryFeeType,
                      tournamentSettings.entryFeeAmount,
                      tournamentSettings.entryFeeCurrency,
                      i18n.language,
                      t
                    )}
                  />
                  <TournamentConfigCard
                    label={t("eventDetail.tournament.bracketLabel")}
                    value={getTournamentBracketLabel(
                      tournamentSettings.bracketType,
                      t
                    )}
                  />
                  <TournamentConfigCard
                    label={t("eventDetail.tournament.stateLabel")}
                    value={getTournamentStateLabel(tournamentSettings.state, t)}
                  />
                  <TournamentConfigCard
                    label={t("eventDetail.tournament.maxTeamsLabel")}
                    value={t("eventDetail.tournament.maxTeamsValue", {
                      count: tournamentSettings.maxTeams,
                    })}
                  />
                  <TournamentConfigCard
                    label={t("eventDetail.tournament.courtsLabel")}
                    value={t("eventDetail.tournament.courtsValue", {
                      count: tournamentSettings.courtCount,
                    })}
                  />
                  <TournamentConfigCard
                    label={t("eventDetail.tournament.matchDurationLabel")}
                    value={t("eventDetail.tournament.matchDurationValue", {
                      count: tournamentSettings.matchDurationMinutes,
                    })}
                  />
                  <TournamentConfigCard
                    label={t("eventDetail.tournament.finalsDurationLabel")}
                    value={t("eventDetail.tournament.finalsDurationValue", {
                      count: tournamentSettings.finalsDurationMinutes,
                    })}
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-4 text-sm text-slate-700">
                  <p className="font-bold text-slate-900">
                    {t("eventDetail.tournament.phaseOneTitle")}
                  </p>
                  <p className="mt-1 leading-6">
                    {t("eventDetail.tournament.phaseOneBody")}
                  </p>
                </div>
              </div>
            ) : null}

            {shouldShowParticipantsCard ? (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                      <h2 className="text-lg font-black text-slate-900">
                        {event.type === "tournament" && !canManageTournament
                          ? t("eventDetail.tournament.teamsTitle")
                          : t("eventDetail.participantsTitle")}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {event.type === "tournament" && !canManageTournament
                          ? t("eventDetail.tournament.confirmedTeamsCount", {
                              count: tournamentTeams.length,
                            })
                          : t("eventDetail.joined", { count: participants.length })}
                      </p>
                    </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                    {hasUnlimitedSpots
                      ? t("eventDetail.unlimited")
                      : spotsLeft && spotsLeft > 0
                        ? t("eventDetail.spotsLeft", { count: spotsLeft })
                        : t("eventDetail.full")}
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
                        {event.type === "tournament" && !canManageTournament
                          ? visibleTournamentTeams.map((entry) => (
                              <TournamentTeamRow
                                key={entry.id}
                                entry={entry}
                              />
                            ))
                          : visibleParticipants.map((participant) => (
                              <ParticipantRow
                                key={participant.id}
                                participant={participant}
                              />
                            ))}
                      </div>

                      {(event.type === "tournament" && !canManageTournament
                        ? tournamentTeams.length > 5
                        : participants.length > 5) ? (
                        <button
                          type="button"
                          onClick={() => setShowAllParticipants((current) => !current)}
                        className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                      >
                          {showAllParticipants
                            ? t("eventDetail.showFewerParticipants")
                            : t("eventDetail.viewAllParticipants", {
                                count:
                                  event.type === "tournament" && !canManageTournament
                                    ? tournamentTeams.length
                                    : participants.length,
                              })}
                        </button>
                      ) : null}
                  </>
                )}
              </div>
            ) : null}
          </div>

          {canAccessEventChat && profile ? (
            <EventChatSection
              eventId={event.id}
              currentUserId={profile.id}
              canSend={!isClosedEvent}
            />
          ) : null}

          {event.type === "tournament" && event.tournamentSettings ? (
            <TournamentRegistrationSection
              eventId={event.id}
              currentUser={profile}
              settings={event.tournamentSettings}
              isManager={canManageTournament}
              canEditTournamentSetup={canEdit}
              coordinators={tournamentCoordinators}
              isClosedEvent={isClosedEvent}
              onRequireLogin={() =>
                navigate(`/login?redirect=/events/${event.id}`)
              }
              onRefreshEvent={async () => {
                await loadEventSummary(event.id);
                await loadTournamentCoordinators(event.id);
              }}
            />
          ) : null}

          {event.type === "match" && canViewMatchPlayers ? (
            <Suspense fallback={<SectionLoadingMessage message={t("eventDetail.loadingTeams")} />}>
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
            <Suspense fallback={<SectionLoadingMessage message={t("eventDetail.loadingResult")} />}>
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

          {event.type !== "tournament" &&
          event.visibility === "private" &&
          !isClosedEvent &&
          eventInvitations.state.pendingInvitationForCurrentUser ? (
            <Suspense fallback={<SectionLoadingMessage message={t("eventDetail.loadingInvitation")} />}>
              <EventInvitationResponseCard
                invitation={eventInvitations.state.pendingInvitationForCurrentUser}
                actionLoadingId={eventInvitations.state.actionLoadingId}
                onAccept={eventInvitations.actions.acceptInvitation}
                onDecline={eventInvitations.actions.declineInvitation}
              />
            </Suspense>
          ) : null}

          {event.type !== "tournament" &&
          event.visibility === "private" &&
          canEdit &&
          !displayIsFull &&
          !isAcceptedMatch &&
          !isClosedEvent ? (
            <Suspense fallback={<SectionLoadingMessage message={t("eventDetail.loadingRequests")} />}>
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
          <div className="hidden rounded-3xl bg-white p-5 shadow-sm md:block">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-black text-slate-900">
                    {t("eventDetail.courtLocation")}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {event.locationName || t("eventDetail.locationPending")}
                  </p>
                </div>

                {directionsUrl ? (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                    aria-label={t("eventDetail.getDirections")}
                    title={t("eventDetail.getDirections")}
                  >
                    <Navigation size={16} />
                  </a>
                ) : null}
              </div>

              <div className="h-52 overflow-hidden rounded-2xl bg-slate-100">
                <Suspense
                  fallback={
                    <SectionLoadingMessage message={t("eventDetail.loadingMap")} />
                  }
                >
                  <EventLocationMap
                    latitude={event.latitude}
                    longitude={event.longitude}
                    title={event.title}
                    locationName={event.locationName}
                  />
                </Suspense>
              </div>
            </div>
          </div>

          <div ref={setSummaryAnchor} />
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              {t("eventDetail.snapshot")}
            </p>

            <div className="mt-4 space-y-3">
              <SidebarInfoRow
                label={t("eventDetail.starts")}
                value={formatEventDate(event.startDate, i18n.language, t("eventDetail.datePending"))}
                icon={<CalendarDays size={16} className="text-blue-600" />}
              />
              <SidebarInfoRow
                label={t("eventDetail.createdBy")}
                value={creatorName || t("eventDetail.loadingCreator")}
                icon={<UserCircle2 size={16} className="text-blue-600" />}
              />
              <SidebarInfoRow
                label={t("mapPage.visibility")}
                value={getEventVisibilityLabel(event.visibility)}
                icon={<Shield size={16} className="text-blue-600" />}
              />
              <SidebarInfoRow
                label={t("eventDetail.labels.location")}
                value={event.locationName || t("eventDetail.locationPending")}
                icon={<MapPin size={16} className="text-blue-600" />}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                {t("eventDetail.availability")}
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {hasUnlimitedSpots ? t("eventDetail.unlimitedShort") : spotsLeft}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {hasUnlimitedSpots
                  ? t("eventDetail.noParticipantLimit")
                  : t("eventDetail.spotsLeftOutOf", {
                      count: spotsLeft ?? 0,
                      total: event.maxParticipants,
                    })}
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
                    ? t("eventDetail.eventFinished")
                    : displayIsFull
                      ? t("eventDetail.eventFull")
                      : joining || isMatchMembershipUpdating
                        ? t("eventDetail.joining")
                        : t("eventDetail.joinEvent")}
                </button>
              ) : event.type === "tournament" ? (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-slate-700">
                  <p className="font-bold text-slate-900">
                    {t("eventDetail.tournament.registrationClosedTitle")}
                  </p>
                  <p className="mt-1 leading-6">
                    {t("eventDetail.tournament.registrationClosedBody")}
                  </p>
                </div>
              ) : !isAcceptedMatch && !isClosedEvent && displayAlreadyJoined ? (
                <button
                  onClick={handleLeaveEvent}
                  disabled={joining || isMatchMembershipUpdating || matchPlayers.state.loading}
                  className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600 disabled:opacity-60"
                >
                  {joining || isMatchMembershipUpdating
                    ? t("eventDetail.leaving")
                    : t("eventDetail.leaveEvent")}
                </button>
              ) : null}

              {canEdit && !isAcceptedMatch && !isClosedEvent ? (
                <Link
                  to={`/events/${event.id}/edit`}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-center font-bold text-slate-700"
                >
                  {t("eventDetail.editEvent")}
                </Link>
              ) : null}

              {canShareLink || canCopyPrivateLink ? (
                <div
                  className={`grid gap-3 ${
                    canShareLink && canCopyPrivateLink ? "sm:grid-cols-2" : ""
                  }`}
                >
                  {canShareLink ? (
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white"
                  >
                    <Share2 size={16} />
                    {t("eventDetail.share")}
                  </button>
                  ) : null}

                  {canCopyPrivateLink ? (
                  <button
                    type="button"
                    onClick={handleCopyPrivateLink}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white"
                  >
                    <Copy size={16} />
                    {t("eventDetail.copyLink")}
                  </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {copyMessage ? (
              <p className="mt-4 text-sm font-medium text-slate-600">
                {copyMessage}
              </p>
            ) : null}
          </div>

          {event.type !== "tournament" &&
          event.visibility === "private" &&
          !canEdit &&
          !displayAlreadyJoined &&
          !isClosedEvent &&
          !isAcceptedMatch ? (
            <Suspense fallback={<SectionLoadingMessage message={t("eventDetail.loadingAccess")} />}>
              <PrivateEventAccessCard
                request={eventJoinRequests.state.myRequest}
                actionLoadingId={eventJoinRequests.state.actionLoadingId}
                onRequestAccess={handleRequestPrivateAccess}
              />
            </Suspense>
          ) : null}
        </aside>
      </section>

      <button
        type="button"
        onClick={scrollToSummary}
        className="fixed bottom-5 right-5 z-[2000] inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(15,23,42,0.28)] transition hover:bg-slate-800 md:hidden"
      >
        <ArrowDownToLine size={16} />
        {t("eventDetail.mobileSummaryCta")}
      </button>
    </section>
  );
}

function ParticipantRow({ participant }: { participant: EventParticipant }) {
  const { t } = useTranslation();

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
          {participant.profile.country || t("eventDetail.labels.beachPlayer")}
        </p>
      </div>
    </div>
  );
}

function TournamentTeamRow({ entry }: { entry: TournamentEntry }) {
  const { t } = useTranslation();
  const label =
    entry.teamName?.trim() ||
    entry.members[0]?.profile.fullName ||
    t("tournamentRegistration.soloEntry");

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
        {label.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{label}</p>
        <p className="truncate text-xs text-slate-500">
          {entry.registrationType === "team"
            ? t("eventDetail.tournament.registrationTeam")
            : t("eventDetail.tournament.registrationIndividual")}
        </p>
      </div>
    </div>
  );
}

function TournamentConfigCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
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
