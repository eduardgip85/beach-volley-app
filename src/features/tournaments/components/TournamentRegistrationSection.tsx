import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Shield, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserProfile } from "../../auth/types/auth.types";
import {
  getTournamentTeamSize,
  type TournamentState,
  type TournamentSettings,
} from "../../events/types/event.types";
import { getFriends } from "../../friends/services/friends.service";
import type { FriendProfile } from "../../friends/types/friends.types";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import { useTournamentBracket } from "../hooks/useTournamentBracket";
import { useTournamentRegistrations } from "../hooks/useTournamentRegistrations";
import {
  addTournamentCoordinator,
  assignTournamentBracketReferee,
  generateTournamentBracket,
  planTournamentMatchSchedule,
  recordTournamentBracketResult,
  removeTournamentCoordinator,
  resetTournamentBracket,
  updateTournamentTeamName,
} from "../services/tournamentManagement.service";
import type { TournamentEntry } from "../types/tournamentRegistration.types";
import { TournamentBracketSection } from "./TournamentBracketSection";
import { TournamentScheduleSection } from "./TournamentScheduleSection";
import { TournamentStandingsSection } from "./TournamentStandingsSection";

interface TournamentRegistrationSectionProps {
  eventId: string;
  currentUser?: UserProfile | null;
  settings: TournamentSettings;
  isManager: boolean;
  canEditTournamentSetup: boolean;
  coordinators?: FriendProfile[];
  isClosedEvent: boolean;
  onRequireLogin: () => void;
  onRefreshEvent: () => Promise<void>;
}

function formatTournamentEntryFee(
  settings: TournamentSettings,
  locale: string,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  if (settings.entryFeeType !== "paid" || !settings.entryFeeAmount) {
    return t("tournamentRegistration.entryFee.freeValue");
  }

  const formattedAmount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: settings.entryFeeCurrency || "EUR",
    maximumFractionDigits: 2,
  }).format(settings.entryFeeAmount);

  return t("tournamentRegistration.entryFee.paidValue", {
    amount: formattedAmount,
  });
}

export function TournamentRegistrationSection({
  eventId,
  currentUser,
  settings,
  isManager,
  canEditTournamentSetup,
  coordinators = [],
  isClosedEvent,
  onRequireLogin,
  onRefreshEvent,
}: TournamentRegistrationSectionProps) {
  const { t, i18n } = useTranslation();
  const [teamName, setTeamName] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [coordinatorCandidates, setCoordinatorCandidates] = useState<FriendProfile[]>(
    []
  );
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState("");
  const [coordinatorLoading, setCoordinatorLoading] = useState(false);
  const [coordinatorActionLoadingId, setCoordinatorActionLoadingId] = useState<
    string | null
  >(null);
  const [coordinatorError, setCoordinatorError] = useState("");
  const [stateActionLoading, setStateActionLoading] = useState<
    TournamentState | "reset" | "generate" | "schedule" | null
  >(null);
  const [bracketRefreshKey, setBracketRefreshKey] = useState(0);
  const teamSize = getTournamentTeamSize(settings.teamFormat);
  const maxFriendSelections = teamSize - 1;

  const tournamentRegistrations = useTournamentRegistrations({
    eventId,
    currentUserId: currentUser?.id,
    settings,
    enabled: true,
  });

  const {
    loading,
    error,
    actionLoadingId,
    confirmedEntries,
    pendingEntries,
    balancedTeamEntries,
    myActiveEntry,
    myPendingInvitation,
    friends,
  } = tournamentRegistrations.state;
  const tournamentBracket = useTournamentBracket({
    eventId,
    enabled: true,
    refreshKey: bracketRefreshKey,
  });

  const confirmedPlayerSlots = useMemo(
    () =>
      confirmedEntries.reduce(
        (total, entry) =>
          total +
          entry.members.filter((member) => member.status === "accepted").length,
        0
      ),
    [confirmedEntries]
  );
  const displayConfirmedTeamEntries =
    settings.registrationType === "individual"
      ? balancedTeamEntries
      : confirmedEntries;
  const displayPendingTeamEntries =
    settings.registrationType === "individual" ? [] : pendingEntries;

  const totalPlayerSlots = settings.maxTeams * teamSize;
  const hasReachedCoordinatorLimit = coordinators.length >= 2;

  useEffect(() => {
    let cancelled = false;

    async function loadCoordinatorCandidates() {
      if (!canEditTournamentSetup || !currentUser?.id) {
        if (!cancelled) {
          setCoordinatorCandidates([]);
          setSelectedCoordinatorId("");
          setCoordinatorLoading(false);
        }
        return;
      }

      try {
        setCoordinatorLoading(true);
        setCoordinatorError("");
        const acceptedFriends = await getFriends(currentUser.id);

        if (cancelled) {
          return;
        }

        const coordinatorIds = new Set(coordinators.map((coordinator) => coordinator.id));
        const nextCandidates = acceptedFriends.filter(
          (friend) =>
            friend.id !== currentUser.id && !coordinatorIds.has(friend.id)
        );

        setCoordinatorCandidates(nextCandidates);
        setSelectedCoordinatorId((currentSelectedId) =>
          nextCandidates.some((candidate) => candidate.id === currentSelectedId)
            ? currentSelectedId
            : nextCandidates[0]?.id ?? ""
        );
      } catch (candidateError) {
        console.error(candidateError);
        if (!cancelled) {
          setCoordinatorCandidates([]);
          setSelectedCoordinatorId("");
          setCoordinatorError(
            t("tournamentRegistration.management.coordinatorLoadError")
          );
        }
      } finally {
        if (!cancelled) {
          setCoordinatorLoading(false);
        }
      }
    }

    void loadCoordinatorCandidates();

    return () => {
      cancelled = true;
    };
  }, [canEditTournamentSetup, coordinators, currentUser?.id, t]);

  async function handleJoinIndividual() {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    await tournamentRegistrations.actions.joinIndividual();
    await onRefreshEvent();
  }

  async function handleCreateTeam() {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    await tournamentRegistrations.actions.createTeam(teamName, selectedFriendIds);
    setTeamName("");
    setSelectedFriendIds([]);
    await onRefreshEvent();
  }

  async function handleAcceptInvitation(memberId: string) {
    await tournamentRegistrations.actions.acceptInvitation(memberId);
    await onRefreshEvent();
  }

  async function handleDeclineInvitation(memberId: string) {
    await tournamentRegistrations.actions.declineInvitation(memberId);
    await onRefreshEvent();
  }

  async function handleCancelEntry(entryId: string) {
    await tournamentRegistrations.actions.cancelEntry(entryId);
    await onRefreshEvent();
  }

  function toggleFriend(friendId: string) {
    setSelectedFriendIds((current) => {
      if (current.includes(friendId)) {
        return current.filter((id) => id !== friendId);
      }

      if (current.length >= maxFriendSelections) {
        return current;
      }

      return [...current, friendId];
    });
  }

  const isRegistrationOpen =
    settings.state === "draft" ||
    settings.state === "open_registration" ||
    settings.state === "full";
  const canSubmitTeam =
    teamName.trim().length >= 2 &&
    selectedFriendIds.length === maxFriendSelections &&
    !isClosedEvent &&
    isRegistrationOpen &&
    !myActiveEntry &&
    !myPendingInvitation;
  const canViewEntryDetails = isManager;

  async function handleResetBracket() {
    try {
      setStateActionLoading("reset");
      tournamentRegistrations.actions.clearError();
      await resetTournamentBracket(eventId);
      await tournamentRegistrations.actions.refresh();
      setBracketRefreshKey((current) => current + 1);
      await onRefreshEvent();
    } catch (resetError) {
      console.error(resetError);
    } finally {
      setStateActionLoading(null);
    }
  }

  async function handleGenerateBracket() {
    try {
      setStateActionLoading("generate");
      tournamentRegistrations.actions.clearError();
      await generateTournamentBracket(eventId);
      await tournamentRegistrations.actions.refresh();
      setBracketRefreshKey((current) => current + 1);
      await onRefreshEvent();
    } catch (generationError) {
      console.error(generationError);
    } finally {
      setStateActionLoading(null);
    }
  }

  async function handleGenerateSchedule() {
    try {
      setStateActionLoading("schedule");
      tournamentRegistrations.actions.clearError();
      await planTournamentMatchSchedule(eventId);
      await tournamentRegistrations.actions.refresh();
      setBracketRefreshKey((current) => current + 1);
      await onRefreshEvent();
    } catch (scheduleError) {
      console.error(scheduleError);
    } finally {
      setStateActionLoading(null);
    }
  }

  async function handleRecordBracketResult(
    bracketMatchId: string,
    sets: Array<{ setNumber: number; sideAScore: number; sideBScore: number }>
  ) {
    await recordTournamentBracketResult(bracketMatchId, sets);
    await tournamentRegistrations.actions.refresh();
    setBracketRefreshKey((current) => current + 1);
    await onRefreshEvent();
  }

  async function handleAssignBracketReferee(
    bracketMatchId: string,
    refereeEntryId: string | null
  ) {
    await assignTournamentBracketReferee(bracketMatchId, refereeEntryId);
    await tournamentRegistrations.actions.refresh();
    setBracketRefreshKey((current) => current + 1);
    await onRefreshEvent();
  }

  async function handleRenameTeam(entryId: string, nextTeamName: string) {
    await updateTournamentTeamName(entryId, nextTeamName);
    await tournamentRegistrations.actions.refresh();
    setBracketRefreshKey((current) => current + 1);
    await onRefreshEvent();
  }

  async function handleAddCoordinator() {
    if (!selectedCoordinatorId) {
      return;
    }

    try {
      setCoordinatorActionLoadingId(`add:${selectedCoordinatorId}`);
      setCoordinatorError("");
      await addTournamentCoordinator(eventId, selectedCoordinatorId);
      await onRefreshEvent();
    } catch (addError: any) {
      console.error(addError);
      setCoordinatorError(
        addError?.message ||
          t("tournamentRegistration.management.coordinatorSaveError")
      );
    } finally {
      setCoordinatorActionLoadingId(null);
    }
  }

  async function handleRemoveCoordinator(userId: string) {
    try {
      setCoordinatorActionLoadingId(`remove:${userId}`);
      setCoordinatorError("");
      await removeTournamentCoordinator(eventId, userId);
      await onRefreshEvent();
    } catch (removeError: any) {
      console.error(removeError);
      setCoordinatorError(
        removeError?.message ||
          t("tournamentRegistration.management.coordinatorSaveError")
      );
    } finally {
      setCoordinatorActionLoadingId(null);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Users size={20} />
        </span>

        <div>
          <h2 className="text-lg font-black text-slate-900">
            {t("tournamentRegistration.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("tournamentRegistration.body")}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <TournamentStatCard
          label={t("tournamentRegistration.stats.registeredPlayers")}
          value={`${confirmedPlayerSlots} / ${totalPlayerSlots}`}
        />
        <TournamentStatCard
          label={t("tournamentRegistration.stats.confirmedTeams")}
          value={`${displayConfirmedTeamEntries.length} / ${settings.maxTeams}`}
        />
        <TournamentStatCard
          label={t("tournamentRegistration.stats.pendingTeams")}
          value={String(displayPendingTeamEntries.length)}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-slate-700">
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
          {t("tournamentRegistration.entryFee.label")}
        </p>
        <p className="mt-2 text-base font-black text-slate-900">
          {formatTournamentEntryFee(settings, i18n.language, t)}
        </p>
        <p className="mt-1 leading-6 text-slate-600">
          {settings.entryFeeType === "paid"
            ? t("tournamentRegistration.entryFee.paidBody")
            : t("tournamentRegistration.entryFee.freeBody")}
        </p>
      </div>

      {error ? (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {isManager ? (
        <TournamentManagementPanel
          settings={settings}
          confirmedEntries={displayConfirmedTeamEntries}
          pendingEntries={displayPendingTeamEntries}
          coordinators={coordinators}
          coordinatorCandidates={coordinatorCandidates}
          canEditTournamentSetup={canEditTournamentSetup}
          coordinatorLoading={coordinatorLoading}
          coordinatorActionLoadingId={coordinatorActionLoadingId}
          coordinatorError={coordinatorError}
          hasReachedCoordinatorLimit={hasReachedCoordinatorLimit}
          selectedCoordinatorId={selectedCoordinatorId}
          stateActionLoading={stateActionLoading}
          isClosedEvent={isClosedEvent}
          hasBracket={tournamentBracket.matches.length > 0}
          onSelectCoordinator={setSelectedCoordinatorId}
          onAddCoordinator={handleAddCoordinator}
          onRemoveCoordinator={handleRemoveCoordinator}
          onResetBracket={handleResetBracket}
          onGenerateBracket={handleGenerateBracket}
          onGenerateSchedule={handleGenerateSchedule}
        />
      ) : null}

      {!isRegistrationOpen ? (
        <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm text-slate-700">
          <p className="font-bold text-slate-900">
            {t("tournamentRegistration.registrationLockedTitle")}
          </p>
          <p className="mt-1 leading-6">
            {t("tournamentRegistration.registrationLockedBody")}
          </p>
        </div>
      ) : null}

      {settings.registrationType === "individual" ? (
        <div className="mt-6 rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-bold text-slate-900">
            {t("tournamentRegistration.individual.title")}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("tournamentRegistration.individual.body")}
          </p>

          {myActiveEntry ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                {t("tournamentRegistration.individual.joined")}
              </span>
              <button
                type="button"
                onClick={() => handleCancelEntry(myActiveEntry.id)}
                disabled={
                  actionLoadingId === `cancel:${myActiveEntry.id}` ||
                  isClosedEvent ||
                  !isRegistrationOpen
                }
                className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 disabled:opacity-60"
              >
                {actionLoadingId === `cancel:${myActiveEntry.id}`
                  ? t("tournamentRegistration.actions.cancelling")
                  : t("tournamentRegistration.actions.cancelRegistration")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleJoinIndividual}
              disabled={
                loading ||
                isClosedEvent ||
                !isRegistrationOpen ||
                actionLoadingId === "join-individual"
              }
              className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-60"
            >
              {actionLoadingId === "join-individual"
                ? t("tournamentRegistration.actions.joining")
                : t("tournamentRegistration.actions.joinIndividual")}
            </button>
          )}
        </div>
      ) : null}

      {settings.registrationType === "team" ? (
        <div className="mt-6 space-y-5">
          {myPendingInvitation ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
              <p className="text-sm font-bold text-slate-900">
                {t("tournamentRegistration.pendingInviteTitle")}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {t("tournamentRegistration.pendingInviteBody", {
                  teamName:
                    myPendingInvitation.entry.teamName ??
                    t("tournamentRegistration.teamFallback"),
                })}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleAcceptInvitation(myPendingInvitation.member.id)}
                  disabled={actionLoadingId === `accept:${myPendingInvitation.member.id}`}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {actionLoadingId === `accept:${myPendingInvitation.member.id}`
                    ? t("tournamentRegistration.actions.accepting")
                    : t("tournamentRegistration.actions.acceptInvite")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeclineInvitation(myPendingInvitation.member.id)}
                  disabled={actionLoadingId === `decline:${myPendingInvitation.member.id}`}
                  className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 disabled:opacity-60"
                >
                  {actionLoadingId === `decline:${myPendingInvitation.member.id}`
                    ? t("tournamentRegistration.actions.declining")
                    : t("tournamentRegistration.actions.declineInvite")}
                </button>
              </div>
            </div>
          ) : null}

          {myActiveEntry ? (
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {myActiveEntry.teamName ?? t("tournamentRegistration.teamFallback")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {myActiveEntry.status === "confirmed"
                      ? t("tournamentRegistration.teamConfirmed")
                      : t("tournamentRegistration.teamPending")}
                  </p>
                </div>

                {(myActiveEntry.captainId === currentUser?.id || isManager) && (
                  <button
                    type="button"
                    onClick={() => handleCancelEntry(myActiveEntry.id)}
                    disabled={
                      actionLoadingId === `cancel:${myActiveEntry.id}` ||
                      isClosedEvent ||
                      !isRegistrationOpen
                    }
                    className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 disabled:opacity-60"
                  >
                    {actionLoadingId === `cancel:${myActiveEntry.id}`
                      ? t("tournamentRegistration.actions.cancelling")
                      : t("tournamentRegistration.actions.cancelTeam")}
                    </button>
                  )}
                </div>

              {isManager ? (
                <div className="mt-4 space-y-3">
                  {myActiveEntry.members.map((member) => (
                    <MemberRow
                      key={member.id}
                      memberName={member.profile.fullName}
                      memberStatus={member.status}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : currentUser ? (
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-bold text-slate-900">
                {t("tournamentRegistration.teamCreateTitle")}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t("tournamentRegistration.teamCreateBody", { count: teamSize })}
              </p>

              <input
                type="text"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder={t("tournamentRegistration.teamNamePlaceholder")}
                className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {t("tournamentRegistration.selectFriends", {
                    count: maxFriendSelections,
                  })}
                </p>

                {friends.length === 0 ? (
                  <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    {t("tournamentRegistration.noFriends")}
                  </p>
                ) : (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {friends.map((friend) => {
                      const isSelected = selectedFriendIds.includes(friend.id);
                      const reachedLimit =
                        !isSelected &&
                        selectedFriendIds.length >= maxFriendSelections;

                      return (
                        <button
                          key={friend.id}
                          type="button"
                          onClick={() => toggleFriend(friend.id)}
                          disabled={reachedLimit}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 bg-white"
                          } disabled:opacity-50`}
                        >
                          <p className="font-bold text-slate-900">
                            {friend.fullName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {friend.country || t("tournamentRegistration.noCountry")}
                          </p>
                          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-blue-700">
                            {t("tournamentRegistration.friendRating", {
                              rating: formatCompetitiveRating(
                                friend.competitiveRating
                              ),
                            })}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCreateTeam}
                disabled={!canSubmitTeam || actionLoadingId === "create-team"}
                className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-60"
              >
                {actionLoadingId === "create-team"
                  ? t("tournamentRegistration.actions.creatingTeam")
                  : t("tournamentRegistration.actions.createTeam")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onRequireLogin}
              className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white"
            >
              {t("tournamentRegistration.actions.loginToJoin")}
            </button>
          )}
        </div>
      ) : null}

      {canViewEntryDetails ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h3 className="font-bold text-slate-900">
                {t("tournamentRegistration.confirmedTeamsTitle")}
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {displayConfirmedTeamEntries.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {t("tournamentRegistration.noConfirmedTeams")}
                </p>
              ) : (
                displayConfirmedTeamEntries.map((entry) => (
                  <EntrySummaryCard
                    key={entry.id}
                    entry={entry}
                    isManager={isManager}
                    onRenameTeam={handleRenameTeam}
                  />
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-amber-600" />
              <h3 className="font-bold text-slate-900">
                {t("tournamentRegistration.pendingTeamsTitle")}
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {displayPendingTeamEntries.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {t("tournamentRegistration.noPendingTeams")}
                </p>
              ) : (
                displayPendingTeamEntries.map((entry) => (
                  <EntrySummaryCard
                    key={entry.id}
                    entry={entry}
                    isManager={isManager}
                    onRenameTeam={handleRenameTeam}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      <TournamentBracketSection
        settings={settings}
        entries={tournamentRegistrations.state.entries}
        matches={tournamentBracket.matches}
        loading={tournamentBracket.loading}
        error={tournamentBracket.error}
      />

      <TournamentStandingsSection
        settings={settings}
        entries={tournamentRegistrations.state.entries}
        matches={tournamentBracket.matches}
      />

      <TournamentScheduleSection
        settings={settings}
        entries={tournamentRegistrations.state.entries}
        matches={tournamentBracket.matches}
        loading={tournamentBracket.loading}
        isManager={isManager}
        onRecordResult={handleRecordBracketResult}
        onAssignReferee={handleAssignBracketReferee}
      />
    </section>
  );
}

function TournamentStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}

function TournamentManagementPanel({
  settings,
  confirmedEntries,
  pendingEntries,
  coordinators,
  coordinatorCandidates,
  canEditTournamentSetup,
  coordinatorLoading,
  coordinatorActionLoadingId,
  coordinatorError,
  hasReachedCoordinatorLimit,
  selectedCoordinatorId,
  stateActionLoading,
  isClosedEvent,
  hasBracket,
  onSelectCoordinator,
  onAddCoordinator,
  onRemoveCoordinator,
  onResetBracket,
  onGenerateBracket,
  onGenerateSchedule,
}: {
  settings: TournamentSettings;
  confirmedEntries: TournamentEntry[];
  pendingEntries: TournamentEntry[];
  coordinators: FriendProfile[];
  coordinatorCandidates: FriendProfile[];
  canEditTournamentSetup: boolean;
  coordinatorLoading: boolean;
  coordinatorActionLoadingId: string | null;
  coordinatorError: string;
  hasReachedCoordinatorLimit: boolean;
  selectedCoordinatorId: string;
  stateActionLoading: TournamentState | "reset" | "generate" | "schedule" | null;
  isClosedEvent: boolean;
  hasBracket: boolean;
  onSelectCoordinator: (userId: string) => void;
  onAddCoordinator: () => Promise<void>;
  onRemoveCoordinator: (userId: string) => Promise<void>;
  onResetBracket: () => Promise<void>;
  onGenerateBracket: () => Promise<void>;
  onGenerateSchedule: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const confirmedTeamsCount = confirmedEntries.length;
  const pendingTeamsCount = pendingEntries.length;
  const canOpenRegistration =
    !isClosedEvent && settings.state !== "open_registration";
  const canPrepareBracket =
    !isClosedEvent &&
    !hasBracket &&
    settings.state !== "in_progress" &&
    settings.state !== "completed" &&
    settings.state !== "cancelled";
  const canGenerateSchedule =
    !isClosedEvent &&
    hasBracket &&
    settings.state !== "completed" &&
    settings.state !== "cancelled";
  const supportsCurrentPhase =
    settings.bracketType === "single_elimination" ||
    settings.bracketType === "round_robin" ||
    settings.bracketType === "group_knockout" ||
    settings.bracketType === "double_elimination";

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <ClipboardList size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-black text-slate-900">
            {t("tournamentRegistration.management.title")}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {t("tournamentRegistration.management.body")}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {t("tournamentRegistration.management.currentState")}
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {t(`eventDetail.tournament.state${toStateKey(settings.state)}`)}
          </p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {t("tournamentRegistration.management.coordinators")}
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {coordinators.length > 0
              ? coordinators.map((coordinator) => coordinator.fullName).join(", ")
              : t("tournamentRegistration.management.noCoordinators")}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {t("tournamentRegistration.management.coordinatorManagerTitle")}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {canEditTournamentSetup
                ? t("tournamentRegistration.management.coordinatorManagerBody")
                : t("tournamentRegistration.management.coordinatorManagerReadOnly")}
            </p>
          </div>
          {canEditTournamentSetup ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
              {t("tournamentRegistration.management.coordinatorLimit", {
                count: coordinators.length,
              })}
            </span>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          {coordinators.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {t("tournamentRegistration.management.noCoordinators")}
            </p>
          ) : (
            coordinators.map((coordinator) => (
              <div
                key={coordinator.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {coordinator.fullName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {coordinator.country ||
                      t("tournamentRegistration.management.noCoordinatorCountry")}
                  </p>
                </div>
                {canEditTournamentSetup ? (
                  <button
                    type="button"
                    onClick={() => onRemoveCoordinator(coordinator.id)}
                    disabled={coordinatorActionLoadingId !== null}
                    className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-600 disabled:opacity-60"
                  >
                    {coordinatorActionLoadingId === `remove:${coordinator.id}`
                      ? t("tournamentRegistration.management.removingCoordinator")
                      : t("tournamentRegistration.management.removeCoordinator")}
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>

        {canEditTournamentSetup ? (
          <div className="mt-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <select
                value={selectedCoordinatorId}
                onChange={(event) => onSelectCoordinator(event.target.value)}
                disabled={
                  coordinatorLoading ||
                  coordinatorActionLoadingId !== null ||
                  hasReachedCoordinatorLimit ||
                  coordinatorCandidates.length === 0
                }
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 disabled:bg-slate-50"
              >
                {coordinatorCandidates.length === 0 ? (
                  <option value="">
                    {t("tournamentRegistration.management.noCoordinatorCandidates")}
                  </option>
                ) : (
                  coordinatorCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.fullName}
                    </option>
                  ))
                )}
              </select>

              <button
                type="button"
                onClick={onAddCoordinator}
                disabled={
                  !selectedCoordinatorId ||
                  coordinatorLoading ||
                  coordinatorActionLoadingId !== null ||
                  hasReachedCoordinatorLimit
                }
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {coordinatorActionLoadingId?.startsWith("add:")
                  ? t("tournamentRegistration.management.addingCoordinator")
                  : t("tournamentRegistration.management.addCoordinator")}
              </button>
            </div>

            {hasReachedCoordinatorLimit ? (
              <p className="mt-3 text-xs text-slate-500">
                {t("tournamentRegistration.management.maxCoordinatorsReached")}
              </p>
            ) : null}

            {!hasReachedCoordinatorLimit &&
            !coordinatorLoading &&
            coordinatorCandidates.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">
                {t("tournamentRegistration.management.noCoordinatorCandidatesHint")}
              </p>
            ) : null}
          </div>
        ) : null}

        {coordinatorError ? (
          <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {coordinatorError}
          </p>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl bg-white px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {t("tournamentRegistration.management.rulesTitle")}
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <p>{t("tournamentRegistration.management.ruleCutoff")}</p>
          <p>{t("tournamentRegistration.management.ruleByes")}</p>
          <p>{t("tournamentRegistration.management.ruleScores")}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {canOpenRegistration ? (
          <button
            type="button"
            onClick={onResetBracket}
            disabled={stateActionLoading !== null}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {stateActionLoading === "reset"
              ? t("tournamentRegistration.management.opening")
              : t("tournamentRegistration.management.openRegistration")}
          </button>
        ) : null}

        {canPrepareBracket && supportsCurrentPhase ? (
          <button
            type="button"
            onClick={onGenerateBracket}
            disabled={stateActionLoading !== null}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {stateActionLoading === "generate"
              ? t("tournamentRegistration.management.preparingBracket")
              : t("tournamentRegistration.management.prepareBracket")}
          </button>
        ) : null}

        {canGenerateSchedule && supportsCurrentPhase ? (
          <button
            type="button"
            onClick={onGenerateSchedule}
            disabled={stateActionLoading !== null}
            className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {stateActionLoading === "schedule"
              ? t("tournamentRegistration.management.scheduling")
              : t("tournamentRegistration.management.generateSchedule")}
          </button>
        ) : null}
      </div>

      {!supportsCurrentPhase ? (
        <p className="mt-3 text-xs text-slate-500">
          {settings.registrationType === "individual"
            ? t("tournamentRegistration.management.individualNextPhase")
            : t("tournamentRegistration.management.otherBracketNextPhase")}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-slate-500">
        {t("tournamentRegistration.management.nextPhaseHint", {
          confirmed: confirmedTeamsCount,
          pending: pendingTeamsCount,
        })}
      </p>
    </div>
  );
}

function toStateKey(state: TournamentState) {
  switch (state) {
    case "open_registration":
      return "OpenRegistration";
    case "full":
      return "Full";
    case "bracket_ready":
      return "BracketReady";
    case "in_progress":
      return "InProgress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Draft";
  }
}

function EntrySummaryCard({
  entry,
  isManager,
  onRenameTeam,
}: {
  entry: {
    id: string;
    teamName: string | null;
    registrationType: string;
    captainId?: string;
    members: Array<{
      id: string;
      userId?: string;
      profile: { fullName: string };
      status: string;
    }>;
  };
  isManager: boolean;
  onRenameTeam: (entryId: string, teamName: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(entry.teamName ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    try {
      setIsSaving(true);
      await onRenameTeam(entry.id, draftName);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="min-w-[180px] rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || draftName.trim().length < 2}
                className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-60"
              >
                {isSaving
                  ? t("tournamentRegistration.management.renaming")
                  : t("tournamentRegistration.management.saveTeamName")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftName(entry.teamName ?? "");
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 disabled:opacity-60"
              >
                {t("tournamentRegistration.management.cancelRename")}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-slate-900">
                {entry.teamName ?? t("tournamentRegistration.soloEntry")}
              </p>
              {isManager ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600"
                >
                  {t("tournamentRegistration.management.renameTeam")}
                </button>
              ) : null}
            </div>
          )}
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
          {entry.registrationType === "team"
            ? t("eventDetail.tournament.registrationTeam")
            : t("eventDetail.tournament.registrationIndividual")}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {entry.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-slate-700">
              {member.profile.fullName}
              {entry.captainId && member.userId === entry.captainId
                ? ` · ${t("tournamentRegistration.management.captain")}`
                : ""}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
              {t(`tournamentRegistration.memberStatuses.${member.status}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberRow({
  memberName,
  memberStatus,
}: {
  memberName: string;
  memberStatus: string;
}) {
  const { t } = useTranslation();
  const isPending = memberStatus === "pending";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="font-medium text-slate-800">{memberName}</span>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
          isPending
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700"
        }`}
      >
        {isPending ? <Shield size={12} /> : <CheckCircle2 size={12} />}
        {t(`tournamentRegistration.memberStatuses.${memberStatus}`)}
      </span>
    </div>
  );
}
