import { Medal, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TournamentSettings } from "../../events/types/event.types";
import type { TournamentEntry } from "../types/tournamentRegistration.types";
import type { TournamentBracketMatch } from "../types/tournamentBracket.types";

interface TournamentStandingsSectionProps {
  settings: TournamentSettings;
  entries: TournamentEntry[];
  matches: TournamentBracketMatch[];
}

interface StandingRow {
  entryId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  setDiff: number;
}

interface StandingGroup {
  key: string;
  label: string | null;
  rows: StandingRow[];
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

function buildStandingsForMatches(
  entries: TournamentEntry[],
  matches: TournamentBracketMatch[],
  fallback: string
) {
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  const activeEntryIds = new Set<string>();

  for (const match of matches) {
    if (match.sideAEntryId) {
      activeEntryIds.add(match.sideAEntryId);
    }

    if (match.sideBEntryId) {
      activeEntryIds.add(match.sideBEntryId);
    }
  }

  const rows = new Map<string, StandingRow>();

  for (const entryId of activeEntryIds) {
    rows.set(entryId, {
      entryId,
      teamName: getEntryLabel(entriesById.get(entryId), fallback),
      played: 0,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      setDiff: 0,
    });
  }

  for (const match of matches) {
    if (
      match.state !== "completed" ||
      !match.sideAEntryId ||
      !match.sideBEntryId ||
      !match.winnerEntryId
    ) {
      continue;
    }

    const sideARow = rows.get(match.sideAEntryId);
    const sideBRow = rows.get(match.sideBEntryId);

    if (!sideARow || !sideBRow) {
      continue;
    }

    sideARow.played += 1;
    sideBRow.played += 1;

    if (match.winnerEntryId === match.sideAEntryId) {
      sideARow.wins += 1;
      sideBRow.losses += 1;
    } else {
      sideBRow.wins += 1;
      sideARow.losses += 1;
    }

    const sideASetWins = match.sets.filter(
      (set) => set.sideAScore > set.sideBScore
    ).length;
    const sideBSetWins = match.sets.filter(
      (set) => set.sideBScore > set.sideAScore
    ).length;

    sideARow.setsWon += sideASetWins;
    sideARow.setsLost += sideBSetWins;
    sideBRow.setsWon += sideBSetWins;
    sideBRow.setsLost += sideASetWins;
  }

  return Array.from(rows.values())
    .map((row) => ({
      ...row,
      setDiff: row.setsWon - row.setsLost,
    }))
    .sort((left, right) => {
      if (right.wins !== left.wins) {
        return right.wins - left.wins;
      }

      if (right.setDiff !== left.setDiff) {
        return right.setDiff - left.setDiff;
      }

      if (right.setsWon !== left.setsWon) {
        return right.setsWon - left.setsWon;
      }

      return left.teamName.localeCompare(right.teamName);
    });
}

export function TournamentStandingsSection({
  settings,
  entries,
  matches,
}: TournamentStandingsSectionProps) {
  const { t } = useTranslation();
  const standingGroups = useMemo<StandingGroup[]>(() => {
    if (
      settings.bracketType !== "round_robin" &&
      settings.bracketType !== "group_knockout"
    ) {
      return [];
    }

    const fallback = t("tournamentRegistration.teamFallback");

    if (settings.bracketType === "round_robin") {
      return [
        {
          key: "overall",
          label: null,
          rows: buildStandingsForMatches(entries, matches, fallback),
        },
      ];
    }

    const groupLabels = Array.from(
      new Set(
        matches
          .filter((match) => match.stageType === "group" && match.groupLabel)
          .map((match) => match.groupLabel as string)
      )
    ).sort((left, right) => left.localeCompare(right));

    return groupLabels.map((groupLabel) => ({
      key: groupLabel,
      label: groupLabel,
      rows: buildStandingsForMatches(
        entries,
        matches.filter(
          (match) =>
            match.stageType === "group" && match.groupLabel === groupLabel
        ),
        fallback
      ),
    }));
  }, [entries, matches, settings.bracketType, t]);

  if (
    settings.bracketType !== "round_robin" &&
    settings.bracketType !== "group_knockout"
  ) {
    return null;
  }

  return (
    <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <TrendingUp size={20} />
        </span>
        <div>
          <h2 className="text-lg font-black text-slate-900">
            {t("tournamentStandings.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {settings.bracketType === "group_knockout"
              ? t("tournamentStandings.bodyGroupKnockout")
              : t("tournamentStandings.body")}
          </p>
        </div>
      </div>

      {standingGroups.every((group) => group.rows.length === 0) ? (
        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          {t("tournamentStandings.empty")}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {standingGroups.map((group) => (
            <div key={group.key}>
              {group.label ? (
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
                  {t("tournamentStandings.groupTitle", { group: group.label })}
                </h3>
              ) : null}

              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      <th className="px-3 py-3">{t("tournamentStandings.rank")}</th>
                      <th className="px-3 py-3">{t("tournamentStandings.team")}</th>
                      <th className="px-3 py-3">{t("tournamentStandings.played")}</th>
                      <th className="px-3 py-3">{t("tournamentStandings.wins")}</th>
                      <th className="px-3 py-3">{t("tournamentStandings.losses")}</th>
                      <th className="px-3 py-3">{t("tournamentStandings.sets")}</th>
                      <th className="px-3 py-3">{t("tournamentStandings.diff")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row, index) => (
                      <tr
                        key={row.entryId}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-3 py-4 font-black text-slate-900">
                          <span className="inline-flex items-center gap-2">
                            {index < 3 ? (
                              <Medal size={14} className="text-amber-500" />
                            ) : null}
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-3 py-4 font-semibold text-slate-800">
                          {row.teamName}
                        </td>
                        <td className="px-3 py-4 text-slate-600">{row.played}</td>
                        <td className="px-3 py-4 text-slate-600">{row.wins}</td>
                        <td className="px-3 py-4 text-slate-600">{row.losses}</td>
                        <td className="px-3 py-4 text-slate-600">
                          {row.setsWon}-{row.setsLost}
                        </td>
                        <td className="px-3 py-4 text-slate-600">
                          {row.setDiff > 0 ? `+${row.setDiff}` : row.setDiff}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
