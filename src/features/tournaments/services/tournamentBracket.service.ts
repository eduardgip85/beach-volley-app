import { supabase } from "../../../config/supabase";
import type {
  TournamentBracketMatch,
  TournamentBracketMatchSet,
} from "../types/tournamentBracket.types";

interface TournamentBracketMatchSetRow {
  id: string;
  bracket_match_id: string;
  set_number: number;
  side_a_score: number;
  side_b_score: number;
}

interface TournamentBracketMatchRow {
  id: string;
  event_id: string;
  round_number: number;
  match_number: number;
  source_match_a_id: string | null;
  source_match_b_id: string | null;
  side_a_entry_id: string | null;
  side_b_entry_id: string | null;
  winner_entry_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  court_number: number | null;
  referee_entry_id: string | null;
  stage_type: TournamentBracketMatch["stageType"];
  group_label: string | null;
  sets?: TournamentBracketMatchSetRow[] | null;
  state: TournamentBracketMatch["state"];
  created_at: string;
  updated_at: string;
}

function mapBracketSet(row: TournamentBracketMatchSetRow): TournamentBracketMatchSet {
  return {
    id: row.id,
    bracketMatchId: row.bracket_match_id,
    setNumber: row.set_number,
    sideAScore: row.side_a_score,
    sideBScore: row.side_b_score,
  };
}

function mapBracketMatch(row: TournamentBracketMatchRow): TournamentBracketMatch {
  return {
    id: row.id,
    eventId: row.event_id,
    roundNumber: row.round_number,
    matchNumber: row.match_number,
    sourceMatchAId: row.source_match_a_id,
    sourceMatchBId: row.source_match_b_id,
    sideAEntryId: row.side_a_entry_id,
    sideBEntryId: row.side_b_entry_id,
    winnerEntryId: row.winner_entry_id,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    courtNumber: row.court_number,
    refereeEntryId: row.referee_entry_id,
    stageType: row.stage_type,
    groupLabel: row.group_label,
    sets: (row.sets ?? [])
      .map(mapBracketSet)
      .sort((left, right) => left.setNumber - right.setNumber),
    state: row.state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

export async function getTournamentBracketMatches(eventId: string) {
  const { data, error } = await supabase
    .from("tournament_bracket_matches")
    .select(
      `
        *,
        sets:tournament_bracket_match_sets(
          id,
          bracket_match_id,
          set_number,
          side_a_score,
          side_b_score
        )
      `
    )
    .eq("event_id", eventId)
    .order("round_number", { ascending: true })
    .order("match_number", { ascending: true });

  if (error) {
    throw new Error(
      extractErrorMessage(error, "Could not load tournament bracket")
    );
  }

  return ((data ?? []) as TournamentBracketMatchRow[]).map(mapBracketMatch);
}

export async function generateTournamentBracket(eventId: string) {
  const { error } = await supabase.rpc("generate_tournament_bracket", {
    target_event_id: eventId,
  });

  if (error) {
    throw new Error(
      extractErrorMessage(error, "Could not generate the tournament bracket")
    );
  }
}

export async function resetTournamentBracket(eventId: string) {
  const { error } = await supabase.rpc("reset_tournament_bracket", {
    target_event_id: eventId,
  });

  if (error) {
    throw new Error(
      extractErrorMessage(error, "Could not reopen tournament registration")
    );
  }
}

export async function planTournamentMatchSchedule(eventId: string) {
  const { error } = await supabase.rpc("plan_tournament_match_schedule", {
    target_event_id: eventId,
  });

  if (error) {
    throw new Error(
      extractErrorMessage(error, "Could not generate the tournament schedule")
    );
  }
}

export async function recordTournamentBracketResult(
  bracketMatchId: string,
  sets: Array<{ setNumber: number; sideAScore: number; sideBScore: number }>
) {
  const { error } = await supabase.rpc("record_tournament_bracket_result", {
    target_bracket_match_id: bracketMatchId,
    target_sets: sets,
  });

  if (error) {
    throw new Error(
      extractErrorMessage(error, "Could not record the tournament result")
    );
  }
}

export async function assignTournamentBracketReferee(
  bracketMatchId: string,
  refereeEntryId: string | null
) {
  const { error } = await supabase.rpc("assign_tournament_bracket_referee", {
    target_bracket_match_id: bracketMatchId,
    target_referee_entry_id: refereeEntryId,
  });

  if (error) {
    throw new Error(
      extractErrorMessage(error, "Could not assign the tournament referee")
    );
  }
}
