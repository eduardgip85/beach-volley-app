import { GitBranch, ShieldAlert, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TournamentSettings } from "../../events/types/event.types";
import type { TournamentEntry } from "../types/tournamentRegistration.types";
import type { TournamentBracketMatch } from "../types/tournamentBracket.types";

interface TournamentBracketSectionProps {
  settings: TournamentSettings;
  entries: TournamentEntry[];
  matches: TournamentBracketMatch[];
  loading: boolean;
  error: string;
}

interface BracketColumn {
  key: string;
  title: string;
  subtitle: string;
  matches: TournamentBracketMatch[];
}

function getEntryLabel(entry: TournamentEntry | undefined, t: (key: string) => string) {
  if (!entry) {
    return t("tournamentBracket.toBeDecided");
  }

  if (entry.teamName?.trim()) {
    return entry.teamName;
  }

  return entry.members[0]?.profile.fullName ?? t("tournamentRegistration.soloEntry");
}

function getKnockoutRoundTitle(
  roundIndex: number,
  totalRounds: number,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  if (roundIndex === totalRounds) {
    return t("tournamentBracket.roundFinal");
  }

  if (roundIndex === totalRounds - 1) {
    return t("tournamentBracket.roundSemifinal");
  }

  return t("tournamentBracket.roundGeneric", { count: roundIndex });
}

function getDoubleEliminationColumnTitle(
  stageType: TournamentBracketMatch["stageType"],
  stageIndex: number,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  if (stageType === "winner_bracket") {
    return stageIndex === 1
      ? t("tournamentBracket.winnerBracketRound", { count: 1 })
      : t("tournamentBracket.winnerBracketFinal");
  }

  if (stageType === "loser_bracket") {
    return stageIndex === 1
      ? t("tournamentBracket.loserBracketRound", { count: 1 })
      : t("tournamentBracket.loserBracketFinal");
  }

  return stageIndex === 1
    ? t("tournamentBracket.grandFinal")
    : t("tournamentBracket.grandFinalReset");
}

function buildBracketColumns(
  settings: TournamentSettings,
  matches: TournamentBracketMatch[],
  t: (key: string, options?: Record<string, unknown>) => string
): BracketColumn[] {
  if (
    settings.bracketType !== "group_knockout" &&
    settings.bracketType !== "double_elimination"
  ) {
    const grouped = new Map<number, TournamentBracketMatch[]>();

    for (const match of matches) {
      const current = grouped.get(match.roundNumber) ?? [];
      current.push(match);
      grouped.set(match.roundNumber, current);
    }

    const rounds = Array.from(grouped.entries()).sort((left, right) => left[0] - right[0]);

    return rounds.map(([roundNumber, roundMatches]) => ({
      key: `round-${roundNumber}`,
      title:
        settings.bracketType === "round_robin"
          ? t("tournamentBracket.groupRoundGeneric", { count: roundNumber })
          : getKnockoutRoundTitle(roundNumber, rounds.length, t),
      subtitle:
        roundMatches.length === 1
          ? t("tournamentBracket.singleMatch")
          : t("tournamentBracket.matchCount", { count: roundMatches.length }),
      matches: roundMatches,
    }));
  }

  if (settings.bracketType === "double_elimination") {
    const columns: BracketColumn[] = [];
    const stageOrder: TournamentBracketMatch["stageType"][] = [
      "winner_bracket",
      "loser_bracket",
      "grand_final",
    ];

    stageOrder.forEach((stageType) => {
      const stageRounds = Array.from(
        new Set(
          matches
            .filter((match) => match.stageType === stageType)
            .map((match) => match.roundNumber)
        )
      ).sort((left, right) => left - right);

      stageRounds.forEach((roundNumber, index) => {
        const roundMatches = matches.filter(
          (match) =>
            match.stageType === stageType && match.roundNumber === roundNumber
        );

        if (roundMatches.length === 0) {
          return;
        }

        columns.push({
          key: `${stageType}-${roundNumber}`,
          title: getDoubleEliminationColumnTitle(stageType, index + 1, t),
          subtitle:
            roundMatches.length === 1
              ? t("tournamentBracket.singleMatch")
              : t("tournamentBracket.matchCount", { count: roundMatches.length }),
          matches: roundMatches,
        });
      });
    });

    return columns;
  }

  const columns: BracketColumn[] = [];
  const groupLabels = Array.from(
    new Set(
      matches
        .filter((match) => match.stageType === "group" && match.groupLabel)
        .map((match) => match.groupLabel as string)
    )
  ).sort((left, right) => left.localeCompare(right));
  const groupRounds = Array.from(
    new Set(
      matches
        .filter((match) => match.stageType === "group")
        .map((match) => match.roundNumber)
    )
  ).sort((left, right) => left - right);

  for (const roundNumber of groupRounds) {
    for (const groupLabel of groupLabels) {
      const roundMatches = matches.filter(
        (match) =>
          match.stageType === "group" &&
          match.groupLabel === groupLabel &&
          match.roundNumber === roundNumber
      );

      if (roundMatches.length === 0) {
        continue;
      }

      columns.push({
        key: `group-${groupLabel}-${roundNumber}`,
        title: t("tournamentBracket.groupTitle", { group: groupLabel }),
        subtitle: t("tournamentBracket.groupRoundWithCount", {
          round: roundNumber,
          count: roundMatches.length,
        }),
        matches: roundMatches,
      });
    }
  }

  const knockoutRounds = Array.from(
    new Set(
      matches
        .filter((match) => match.stageType === "knockout")
        .map((match) => match.roundNumber)
    )
  ).sort((left, right) => left - right);

  knockoutRounds.forEach((roundNumber, index) => {
    const roundMatches = matches.filter(
      (match) =>
        match.stageType === "knockout" && match.roundNumber === roundNumber
    );

    if (roundMatches.length === 0) {
      return;
    }

    columns.push({
      key: `knockout-${roundNumber}`,
      title: getKnockoutRoundTitle(index + 1, knockoutRounds.length, t),
      subtitle:
        roundMatches.length === 1
          ? t("tournamentBracket.singleMatch")
          : t("tournamentBracket.matchCount", { count: roundMatches.length }),
      matches: roundMatches,
    });
  });

  return columns;
}

export function TournamentBracketSection({
  settings,
  entries,
  matches,
  loading,
  error,
}: TournamentBracketSectionProps) {
  const { t } = useTranslation();
  const columns = useMemo(
    () => buildBracketColumns(settings, matches, t),
    [matches, settings, t]
  );
  const entriesById = useMemo(
    () => new Map(entries.map((entry) => [entry.id, entry])),
    [entries]
  );
  const supportsCurrentPhase =
    settings.bracketType === "single_elimination" ||
    settings.bracketType === "round_robin" ||
    settings.bracketType === "group_knockout" ||
    settings.bracketType === "double_elimination";

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <GitBranch size={20} />
        </span>
        <div>
          <h2 className="text-lg font-black text-slate-900">
            {t("tournamentBracket.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {settings.bracketType === "round_robin"
              ? t("tournamentBracket.bodyRoundRobin")
              : settings.bracketType === "group_knockout"
                ? t("tournamentBracket.bodyGroupKnockout")
                : settings.bracketType === "double_elimination"
                  ? t("tournamentBracket.bodyDoubleElimination")
                : t("tournamentBracket.body")}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-slate-500">
          {t("tournamentBracket.loading")}
        </p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {!loading && !error && !supportsCurrentPhase ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 text-amber-700" />
            <div>
              <p className="font-bold text-slate-900">
                {t("tournamentBracket.unsupportedTypeTitle")}
              </p>
              <p className="mt-1 leading-6">
                {t("tournamentBracket.unsupportedTypeBody")}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && !error && supportsCurrentPhase && matches.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          {t("tournamentBracket.empty")}
        </div>
      ) : null}

      {!loading && !error && supportsCurrentPhase && matches.length > 0 ? (
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {columns.map((column) => (
              <div key={column.key} className="w-[290px] shrink-0">
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">
                    {column.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{column.subtitle}</p>
                </div>

                <div className="mt-3 space-y-3">
                  {column.matches.map((match) => {
                    const sideAEntry = match.sideAEntryId
                      ? entriesById.get(match.sideAEntryId)
                      : undefined;
                    const sideBEntry = match.sideBEntryId
                      ? entriesById.get(match.sideBEntryId)
                      : undefined;
                    const winnerEntry = match.winnerEntryId
                      ? entriesById.get(match.winnerEntryId)
                      : undefined;

                    return (
                      <div
                        key={match.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                            {t("tournamentBracket.matchLabel", {
                              count: match.matchNumber,
                            })}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                            {t(`tournamentBracket.states.${match.state}`)}
                          </span>
                        </div>

                        {settings.bracketType === "group_knockout" ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                              {match.stageType === "group"
                                ? t("tournamentBracket.groupStageBadge", {
                                    group: match.groupLabel ?? "A",
                                  })
                                : t("tournamentBracket.knockoutStageBadge")}
                            </span>
                          </div>
                        ) : settings.bracketType === "double_elimination" ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
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

                        <div className="mt-3 space-y-2">
                          <BracketEntryRow
                            label={getEntryLabel(sideAEntry, t)}
                            isWinner={winnerEntry?.id === sideAEntry?.id}
                          />
                          <BracketEntryRow
                            label={getEntryLabel(sideBEntry, t)}
                            isWinner={winnerEntry?.id === sideBEntry?.id}
                          />
                        </div>

                        {match.state === "bye" && winnerEntry ? (
                          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                            <Trophy size={12} />
                            {t("tournamentBracket.byeAdvance", {
                              team: getEntryLabel(winnerEntry, t),
                            })}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BracketEntryRow({
  label,
  isWinner,
}: {
  label: string;
  isWinner: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-3 py-3 text-sm font-semibold ${
        isWinner
          ? "bg-emerald-50 text-emerald-800"
          : "bg-slate-50 text-slate-700"
      }`}
    >
      {label}
    </div>
  );
}
