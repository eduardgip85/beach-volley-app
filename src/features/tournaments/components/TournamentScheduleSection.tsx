import { CalendarDays, Shield, TimerReset, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TournamentSettings } from "../../events/types/event.types";
import type { TournamentEntry } from "../types/tournamentRegistration.types";
import type {
  TournamentBracketMatch,
  TournamentBracketMatchSet,
} from "../types/tournamentBracket.types";

interface TournamentScheduleSectionProps {
  settings: TournamentSettings;
  entries: TournamentEntry[];
  matches: TournamentBracketMatch[];
  loading: boolean;
  isManager: boolean;
  onRecordResult: (
    bracketMatchId: string,
    sets: Array<{ setNumber: number; sideAScore: number; sideBScore: number }>
  ) => Promise<void>;
  onAssignReferee: (
    bracketMatchId: string,
    refereeEntryId: string | null
  ) => Promise<void>;
}

interface EditableSetDraft {
  setNumber: number;
  sideAScore: string;
  sideBScore: string;
}

function getEntryLabel(entry: TournamentEntry | undefined, fallback: string) {
  if (!entry) {
    return fallback;
  }

  if (entry.teamName?.trim()) {
    return entry.teamName;
  }

  return entry.members[0]?.profile.fullName ?? fallback;
}

function getKnockoutRoundTitle(
  roundNumber: number,
  totalRounds: number,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  if (roundNumber === totalRounds) {
    return t("tournamentBracket.roundFinal");
  }

  if (roundNumber === totalRounds - 1) {
    return t("tournamentBracket.roundSemifinal");
  }

  return t("tournamentBracket.roundGeneric", { count: roundNumber });
}

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function createEditableDrafts(
  isBestOfThree: boolean,
  existingSets: TournamentBracketMatchSet[]
): EditableSetDraft[] {
  if (existingSets.length > 0) {
    const mapped = existingSets.map((set) => ({
      setNumber: set.setNumber,
      sideAScore: String(set.sideAScore),
      sideBScore: String(set.sideBScore),
    }));

    if (isBestOfThree && mapped.length < 3) {
      return [
        ...mapped,
        ...Array.from({ length: 3 - mapped.length }, (_, index) => ({
          setNumber: mapped.length + index + 1,
          sideAScore: "",
          sideBScore: "",
        })),
      ];
    }

    return mapped;
  }

  if (isBestOfThree) {
    return [1, 2, 3].map((setNumber) => ({
      setNumber,
      sideAScore: "",
      sideBScore: "",
    }));
  }

  return [
    {
      setNumber: 1,
      sideAScore: "",
      sideBScore: "",
    },
  ];
}

function getWinnerLabel(
  match: TournamentBracketMatch,
  entriesById: Map<string, TournamentEntry>,
  fallback: string
) {
  if (!match.winnerEntryId) {
    return "";
  }

  return getEntryLabel(entriesById.get(match.winnerEntryId), fallback);
}

function getScheduleRoundTitle(
  settings: TournamentSettings,
  roundMatches: TournamentBracketMatch[],
  knockoutRoundNumbers: number[],
  totalRounds: number,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  const firstMatch = roundMatches[0];

  if (!firstMatch) {
    return "";
  }

  if (settings.bracketType === "round_robin") {
    return t("tournamentBracket.groupRoundGeneric", {
      count: firstMatch.roundNumber,
    });
  }

  if (settings.bracketType === "group_knockout") {
    if (roundMatches.every((match) => match.stageType === "group")) {
      return t("tournamentBracket.groupRoundGeneric", {
        count: firstMatch.roundNumber,
      });
    }

    if (roundMatches.every((match) => match.stageType === "knockout")) {
      const knockoutIndex =
        knockoutRoundNumbers.indexOf(firstMatch.roundNumber) + 1;

      return getKnockoutRoundTitle(
        knockoutIndex,
        knockoutRoundNumbers.length,
        t
      );
    }
  }

  if (settings.bracketType === "double_elimination") {
    return t("tournamentBracket.roundGeneric", {
      count: firstMatch.roundNumber,
    });
  }

  return getKnockoutRoundTitle(firstMatch.roundNumber, totalRounds, t);
}

function isBestOfThreeMatch(
  settings: TournamentSettings,
  match: TournamentBracketMatch,
  totalRounds: number
) {
  if (settings.bracketType === "group_knockout") {
    return match.stageType === "knockout";
  }

  if (settings.bracketType === "single_elimination") {
    return match.roundNumber >= Math.max(totalRounds - 1, 1);
  }

  if (settings.bracketType === "double_elimination") {
    if (match.stageType === "grand_final") {
      return true;
    }

    if (match.stageType === "winner_bracket") {
      return match.roundNumber >= 2;
    }

    if (match.stageType === "loser_bracket") {
      return match.roundNumber >= 3;
    }
  }

  return false;
}

export function TournamentScheduleSection({
  settings,
  entries,
  matches,
  loading,
  isManager,
  onRecordResult,
  onAssignReferee,
}: TournamentScheduleSectionProps) {
  const { t, i18n } = useTranslation();
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [assigningRefereeMatchId, setAssigningRefereeMatchId] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const [draftsByMatchId, setDraftsByMatchId] = useState<
    Record<string, EditableSetDraft[]>
  >({});
  const [refereeDraftByMatchId, setRefereeDraftByMatchId] = useState<
    Record<string, string>
  >({});

  const entriesById = useMemo(
    () => new Map(entries.map((entry) => [entry.id, entry])),
    [entries]
  );
  const scheduledMatches = useMemo(
    () => matches.filter((match) => match.scheduledStart),
    [matches]
  );
  const matchesByRound = useMemo(() => {
    const grouped = new Map<number, TournamentBracketMatch[]>();

    for (const match of scheduledMatches) {
      const current = grouped.get(match.roundNumber) ?? [];
      current.push(match);
      grouped.set(match.roundNumber, current);
    }

    return Array.from(grouped.entries()).sort((left, right) => left[0] - right[0]);
  }, [scheduledMatches]);
  const knockoutRoundNumbers = useMemo(
    () =>
      Array.from(
        new Set(
          scheduledMatches
            .filter((match) => match.stageType === "knockout")
            .map((match) => match.roundNumber)
        )
      ).sort((left, right) => left - right),
    [scheduledMatches]
  );
  const activeTeamEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.status === "confirmed" &&
          (entry.registrationType === "team" || entry.entryKind === "balanced_team")
      ),
    [entries]
  );

  function getDraftsForMatch(
    match: TournamentBracketMatch,
    totalRounds: number
  ): EditableSetDraft[] {
    if (draftsByMatchId[match.id]) {
      return draftsByMatchId[match.id];
    }

    return createEditableDrafts(
      isBestOfThreeMatch(settings, match, totalRounds),
      match.sets
    );
  }

  function updateDraftScore(
    matchId: string,
    setNumber: number,
    side: "sideAScore" | "sideBScore",
    value: string,
    totalRounds: number,
    match: TournamentBracketMatch
  ) {
    setDraftsByMatchId((current) => {
      const existingDrafts =
        current[matchId] ?? getDraftsForMatch(match, totalRounds);

      return {
        ...current,
        [matchId]: existingDrafts.map((draft) =>
          draft.setNumber === setNumber
            ? {
                ...draft,
                [side]: value,
              }
            : draft
        ),
      };
    });
  }

  async function handleSaveResult(
    match: TournamentBracketMatch,
    totalRounds: number
  ) {
    try {
      setSavingMatchId(match.id);
      setLocalError("");
      const drafts = getDraftsForMatch(match, totalRounds);
      const parsedSets = drafts
        .filter(
          (draft) =>
            draft.sideAScore.trim().length > 0 && draft.sideBScore.trim().length > 0
        )
        .map((draft) => ({
          setNumber: draft.setNumber,
          sideAScore: Number(draft.sideAScore),
          sideBScore: Number(draft.sideBScore),
        }));

      await onRecordResult(match.id, parsedSets);
      setDraftsByMatchId((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[match.id];
        return nextDrafts;
      });
    } catch (error) {
      console.error(error);
      setLocalError(
        error instanceof Error
          ? error.message
          : "Could not record this tournament result"
      );
    } finally {
      setSavingMatchId(null);
    }
  }

  function getRefereeOptions(match: TournamentBracketMatch) {
    if (!match.scheduledStart) {
      return [];
    }

    const sameSlotMatches = matches.filter(
      (candidate) => candidate.scheduledStart === match.scheduledStart
    );
    const playingIds = new Set<string>();
    const assignedRefereeIds = new Set<string>();

    for (const candidate of sameSlotMatches) {
      if (candidate.sideAEntryId) {
        playingIds.add(candidate.sideAEntryId);
      }

      if (candidate.sideBEntryId) {
        playingIds.add(candidate.sideBEntryId);
      }

      if (candidate.id !== match.id && candidate.refereeEntryId) {
        assignedRefereeIds.add(candidate.refereeEntryId);
      }
    }

    const options = activeTeamEntries.filter(
      (entry) => !playingIds.has(entry.id) && !assignedRefereeIds.has(entry.id)
    );

    if (
      match.refereeEntryId &&
      !options.some((entry) => entry.id === match.refereeEntryId)
    ) {
      const currentReferee = activeTeamEntries.find(
        (entry) => entry.id === match.refereeEntryId
      );

      if (currentReferee) {
        return [currentReferee, ...options];
      }
    }

    return options;
  }

  async function handleAssignReferee(match: TournamentBracketMatch) {
    try {
      setAssigningRefereeMatchId(match.id);
      setLocalError("");
      const selectedRefereeId = refereeDraftByMatchId[match.id];
      await onAssignReferee(match.id, selectedRefereeId || null);
    } catch (error) {
      console.error(error);
      setLocalError(
        error instanceof Error
          ? error.message
          : "Could not assign the tournament referee"
      );
    } finally {
      setAssigningRefereeMatchId(null);
    }
  }

  return (
    <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <CalendarDays size={20} />
        </span>

        <div>
          <h2 className="text-lg font-black text-slate-900">
            {t("tournamentSchedule.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("tournamentSchedule.body")}
          </p>
        </div>
      </div>

      {localError ? (
        <div className="mt-5 rounded-2xl bg-red-50 px-4 py-4 text-sm text-red-600">
          {localError}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          {t("tournamentBracket.loading")}
        </div>
      ) : scheduledMatches.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          {t("tournamentSchedule.empty")}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {matchesByRound.map(([roundNumber, roundMatches]) => (
            <div key={roundNumber} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
                  {getScheduleRoundTitle(
                    settings,
                    roundMatches,
                    knockoutRoundNumbers,
                    matchesByRound.length,
                    t
                  )}
                </h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                  {roundMatches.length === 1
                    ? t("tournamentBracket.singleMatch")
                    : t("tournamentBracket.matchCount", {
                        count: roundMatches.length,
                      })}
                </span>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {roundMatches.map((match) => {
                  const sideAEntry = match.sideAEntryId
                    ? entriesById.get(match.sideAEntryId)
                    : undefined;
                  const sideBEntry = match.sideBEntryId
                    ? entriesById.get(match.sideBEntryId)
                    : undefined;
                  const refereeEntry = match.refereeEntryId
                    ? entriesById.get(match.refereeEntryId)
                    : undefined;
                  const winnerLabel = getWinnerLabel(
                    match,
                    entriesById,
                    t("tournamentBracket.toBeDecided")
                  );
                  const drafts = getDraftsForMatch(match, matchesByRound.length);
                  const refereeOptions = getRefereeOptions(match);
                  const selectedRefereeId =
                    refereeDraftByMatchId[match.id] ??
                    match.refereeEntryId ??
                    "";
                  const canRecordResult =
                    isManager &&
                    match.state === "ready" &&
                    Boolean(match.sideAEntryId && match.sideBEntryId);
                  const canManageReferee =
                    isManager &&
                    Boolean(match.scheduledStart) &&
                    match.state !== "bye" &&
                    match.state !== "empty";

                  return (
                    <article
                      key={match.id}
                      className="rounded-2xl bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          {t("tournamentSchedule.matchLabel", {
                            count: match.matchNumber,
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                            {t(`tournamentBracket.states.${match.state}`)}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                            {match.courtNumber
                              ? t("tournamentSchedule.courtLabel", {
                                  count: match.courtNumber,
                                })
                              : t("tournamentSchedule.endPending")}
                          </span>
                        </div>
                      </div>

                      {settings.bracketType === "group_knockout" ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                            {match.stageType === "group"
                              ? t("tournamentBracket.groupStageBadge", {
                                  group: match.groupLabel ?? "A",
                                })
                              : t("tournamentBracket.knockoutStageBadge")}
                          </span>
                        </div>
                      ) : settings.bracketType === "double_elimination" ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                            {match.stageType === "winner_bracket"
                              ? t("tournamentBracket.winnerBracketBadge")
                              : match.stageType === "loser_bracket"
                                ? t("tournamentBracket.loserBracketBadge")
                                : match.roundNumber >= 5
                                  ? t("tournamentBracket.grandFinalResetBadge")
                                  : t("tournamentBracket.grandFinalBadge")}
                          </span>
                        </div>
                      ) : null}

                      <div className="mt-3 space-y-2 text-sm font-semibold text-slate-800">
                        <div className="rounded-2xl bg-white px-3 py-3">
                          {getEntryLabel(
                            sideAEntry,
                            t("tournamentBracket.toBeDecided")
                          )}
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-3">
                          {getEntryLabel(
                            sideBEntry,
                            t("tournamentBracket.toBeDecided")
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                          <TimerReset size={12} />
                          {match.scheduledStart
                            ? formatDateTime(match.scheduledStart, i18n.language)
                            : t("tournamentSchedule.endPending")}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                          {match.scheduledEnd
                            ? t("tournamentSchedule.endsAt", {
                                time: formatDateTime(
                                  match.scheduledEnd,
                                  i18n.language
                                ),
                              })
                            : t("tournamentSchedule.endPending")}
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3">
                        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          <Shield size={12} />
                          {t("tournamentSchedule.refereeTitle")}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {refereeEntry
                            ? getEntryLabel(
                                refereeEntry,
                                t("tournamentSchedule.refereePending")
                              )
                            : t("tournamentSchedule.refereePending")}
                        </p>

                        {canManageReferee ? (
                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <select
                              value={selectedRefereeId}
                              onChange={(event) =>
                                setRefereeDraftByMatchId((current) => ({
                                  ...current,
                                  [match.id]: event.target.value,
                                }))
                              }
                              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                            >
                              <option value="">
                                {t("tournamentSchedule.refereeSelectPlaceholder")}
                              </option>
                              {refereeOptions.map((entry) => (
                                <option key={entry.id} value={entry.id}>
                                  {getEntryLabel(
                                    entry,
                                    t("tournamentRegistration.teamFallback")
                                  )}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleAssignReferee(match)}
                              disabled={assigningRefereeMatchId === match.id}
                              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                            >
                              {assigningRefereeMatchId === match.id
                                ? t("tournamentSchedule.savingReferee")
                                : t("tournamentSchedule.saveReferee")}
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {match.sets.length > 0 ? (
                        <div className="mt-4 rounded-2xl bg-white px-4 py-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            {t("tournamentSchedule.resultTitle")}
                          </p>
                          <div className="mt-3 space-y-2">
                            {match.sets.map((set) => (
                              <div
                                key={set.id}
                                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800"
                              >
                                <span>
                                  {t("tournamentSchedule.setLabel", {
                                    count: set.setNumber,
                                  })}
                                </span>
                                <span>
                                  {set.sideAScore} - {set.sideBScore}
                                </span>
                              </div>
                            ))}
                          </div>

                          {winnerLabel ? (
                            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                              <Trophy size={12} />
                              {t("tournamentSchedule.winnerLabel", {
                                team: winnerLabel,
                              })}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {canRecordResult ? (
                        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
                            {t("tournamentSchedule.resultTitle")}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {t("tournamentSchedule.recordHint")}
                          </p>

                          <div className="mt-4 space-y-3">
                            {drafts.map((draft) => (
                              <div
                                key={`${match.id}-${draft.setNumber}`}
                                className="grid gap-3 rounded-2xl bg-white px-3 py-3 sm:grid-cols-[auto,1fr,1fr]"
                              >
                                <span className="self-center text-xs font-bold uppercase tracking-wide text-slate-500">
                                  {t("tournamentSchedule.setLabel", {
                                    count: draft.setNumber,
                                  })}
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  value={draft.sideAScore}
                                  onChange={(event) =>
                                    updateDraftScore(
                                      match.id,
                                      draft.setNumber,
                                      "sideAScore",
                                      event.target.value,
                                      matchesByRound.length,
                                      match
                                    )
                                  }
                                  placeholder={t("tournamentSchedule.teamAScore")}
                                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                  type="number"
                                  min={0}
                                  value={draft.sideBScore}
                                  onChange={(event) =>
                                    updateDraftScore(
                                      match.id,
                                      draft.setNumber,
                                      "sideBScore",
                                      event.target.value,
                                      matchesByRound.length,
                                      match
                                    )
                                  }
                                  placeholder={t("tournamentSchedule.teamBScore")}
                                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                />
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleSaveResult(match, matchesByRound.length)
                            }
                            disabled={savingMatchId === match.id}
                            className="mt-4 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                          >
                            {savingMatchId === match.id
                              ? t("tournamentSchedule.savingResult")
                              : t("tournamentSchedule.saveResult")}
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
