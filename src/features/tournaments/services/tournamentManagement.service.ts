import { supabase } from "../../../config/supabase";
import { invalidateEventServiceCache } from "../../events/services/events.service";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import type { TournamentState } from "../../events/types/event.types";
import type { FriendProfile } from "../../friends/types/friends.types";
import {
  assignTournamentBracketReferee as assignBracketRefereeRpc,
  generateTournamentBracket as generateBracketRpc,
  planTournamentMatchSchedule as planScheduleRpc,
  recordTournamentBracketResult as recordBracketResultRpc,
  resetTournamentBracket as resetBracketRpc,
} from "./tournamentBracket.service";
import { updateTournamentTeamName as updateTournamentTeamNameRpc } from "./tournamentRegistrations.service";

interface TournamentCoordinatorRow {
  user:
    | {
        id: string;
        full_name: string;
        avatar_url: string | null;
        country: string | null;
        competitive_rating: number | null;
      }
    | {
        id: string;
        full_name: string;
        avatar_url: string | null;
        country: string | null;
        competitive_rating: number | null;
      }[];
}

function normalizeTournamentCoordinatorRelation(
  relation: TournamentCoordinatorRow["user"]
) {
  return Array.isArray(relation) ? relation[0] : relation;
}

interface TournamentCoordinatorProfile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    country: string | null;
    competitive_rating: number | null;
}

export async function getTournamentCoordinators(
  eventId: string
): Promise<FriendProfile[]> {
  const { data, error } = await supabase
    .from("tournament_coordinators")
    .select(
      `
        user:profiles!tournament_coordinators_user_id_fkey(
          id,
          full_name,
          avatar_url,
          country,
          competitive_rating
        )
      `
    )
    .eq("event_id", eventId);

  if (error) {
    throw error;
  }

  return ((data ?? []) as TournamentCoordinatorRow[])
    .map((row) => normalizeTournamentCoordinatorRelation(row.user))
    .filter(Boolean)
    .map((user: TournamentCoordinatorProfile) => ({
      id: user.id,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      country: user.country,
      competitiveRating: user.competitive_rating ?? DEFAULT_COMPETITIVE_RATING,
    }));
}

export async function addTournamentCoordinator(
  eventId: string,
  userId: string
) {
  const { count, error: existingError } = await supabase
    .from("tournament_coordinators")
    .select("event_id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (existingError) {
    throw existingError;
  }

  if ((count ?? 0) > 0) {
    invalidateEventServiceCache();
    return;
  }

  const { error } = await supabase.from("tournament_coordinators").insert({
    event_id: eventId,
    user_id: userId,
  });

  if (error) {
    throw error;
  }

  invalidateEventServiceCache();
}

export async function removeTournamentCoordinator(
  eventId: string,
  userId: string
) {
  const { error } = await supabase
    .from("tournament_coordinators")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  invalidateEventServiceCache();
}

export async function updateTournamentState(
  eventId: string,
  state: TournamentState
) {
  const { error } = await supabase
    .from("tournament_settings")
    .update({
      state,
      updated_at: new Date().toISOString(),
    })
    .eq("event_id", eventId);

  if (error) {
    throw error;
  }

  invalidateEventServiceCache();
}

export async function generateTournamentBracket(eventId: string) {
  await generateBracketRpc(eventId);
  invalidateEventServiceCache();
}

export async function resetTournamentBracket(eventId: string) {
  await resetBracketRpc(eventId);
  invalidateEventServiceCache();
}

export async function planTournamentMatchSchedule(eventId: string) {
  await planScheduleRpc(eventId);
  invalidateEventServiceCache();
}

export async function recordTournamentBracketResult(
  bracketMatchId: string,
  sets: Array<{ setNumber: number; sideAScore: number; sideBScore: number }>
) {
  await recordBracketResultRpc(bracketMatchId, sets);
  invalidateEventServiceCache();
}

export async function assignTournamentBracketReferee(
  bracketMatchId: string,
  refereeEntryId: string | null
) {
  await assignBracketRefereeRpc(bracketMatchId, refereeEntryId);
  invalidateEventServiceCache();
}

export async function updateTournamentTeamName(
  entryId: string,
  teamName: string
) {
  await updateTournamentTeamNameRpc(entryId, teamName);
  invalidateEventServiceCache();
}
