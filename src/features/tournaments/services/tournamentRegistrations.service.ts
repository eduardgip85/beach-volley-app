import { supabase } from "../../../config/supabase";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import type { InvitationEventSummary } from "../../event-invitations/types/eventInvitation.types";
import type {
  TournamentEntry,
  TournamentTeamInvitation,
} from "../types/tournamentRegistration.types";

interface TournamentEntryMemberProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  country: string | null;
  competitive_rating: number | null;
}

interface TournamentEntryMemberRow {
  id: string;
  entry_id: string;
  user_id: string;
  invited_by: string;
  status:
    | "accepted"
    | "pending"
    | "declined"
    | "cancelled"
    | "expired";
  created_at: string;
  updated_at: string;
  profile:
    | TournamentEntryMemberProfileRow[]
    | TournamentEntryMemberProfileRow;
}

interface TournamentEntryRow {
  id: string;
  event_id: string;
  captain_id: string;
  registration_type: "individual" | "team";
  entry_kind: "registration" | "balanced_team";
  team_name: string | null;
  status: "pending" | "confirmed" | "cancelled" | "expired";
  generated_team_number: number | null;
  created_at: string;
  updated_at: string;
  members: TournamentEntryMemberRow[];
}

interface TournamentInvitationEventRow {
  id: string;
  title: string;
  type: "match" | "open_play" | "tournament";
  mode: "casual" | "competitive" | null;
  visibility: "public" | "private";
  location_name: string;
  start_date: string;
  max_participants: number;
  status: "active" | "cancelled" | "completed";
  created_by: string;
}

interface TournamentInvitationEntryRow {
  id: string;
  event_id: string;
  team_name: string | null;
  event: TournamentInvitationEventRow[] | TournamentInvitationEventRow;
}

interface TournamentTeamInvitationRow {
  id: string;
  entry_id: string;
  created_at: string;
  updated_at: string;
  inviter:
    | TournamentEntryMemberProfileRow[]
    | TournamentEntryMemberProfileRow;
  entry: TournamentInvitationEntryRow[] | TournamentInvitationEntryRow;
}

function normalizeRelation<T>(relation: T[] | T): T {
  return Array.isArray(relation) ? relation[0] : relation;
}

function mapTournamentEntry(row: TournamentEntryRow): TournamentEntry {
  return {
    id: row.id,
    eventId: row.event_id,
    captainId: row.captain_id,
    registrationType: row.registration_type,
    entryKind: row.entry_kind,
    teamName: row.team_name,
    status: row.status,
    generatedTeamNumber: row.generated_team_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    members: row.members.map((member) => {
      const profile = normalizeRelation(member.profile);

      return {
        id: member.id,
        entryId: member.entry_id,
        userId: member.user_id,
        invitedBy: member.invited_by,
        status: member.status,
        createdAt: member.created_at,
        updatedAt: member.updated_at,
        profile: {
          id: profile.id,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          country: profile.country,
          competitiveRating:
            profile.competitive_rating ?? DEFAULT_COMPETITIVE_RATING,
        },
      };
    }),
  };
}

function mapInvitationEvent(
  row: TournamentInvitationEventRow
): InvitationEventSummary {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    mode: row.mode,
    visibility: row.visibility,
    locationName: row.location_name,
    startDate: row.start_date,
    maxParticipants: row.max_participants,
    status: row.status,
    createdBy: row.created_by,
  };
}

function mapTournamentInvitation(
  row: TournamentTeamInvitationRow
): TournamentTeamInvitation {
  const inviter = normalizeRelation(row.inviter);
  const entry = normalizeRelation(row.entry);

  return {
    memberId: row.id,
    entryId: row.entry_id,
    eventId: entry.event_id,
    teamName: entry.team_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    inviter: {
      id: inviter.id,
      fullName: inviter.full_name,
      avatarUrl: inviter.avatar_url,
      country: inviter.country,
      competitiveRating:
        inviter.competitive_rating ?? DEFAULT_COMPETITIVE_RATING,
    },
    event: mapInvitationEvent(normalizeRelation(entry.event)),
  };
}

function extractRpcError(error: unknown, fallback: string) {
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

export async function getTournamentEntries(
  eventId: string
): Promise<TournamentEntry[]> {
  const { data, error } = await supabase
    .from("tournament_entries")
    .select(
      `
        id,
        event_id,
        captain_id,
        registration_type,
        entry_kind,
        team_name,
        status,
        generated_team_number,
        created_at,
        updated_at,
        members:tournament_entry_members(
          id,
          entry_id,
          user_id,
          invited_by,
          status,
          created_at,
          updated_at,
          profile:profiles!tournament_entry_members_user_id_fkey(
            id,
            full_name,
            avatar_url,
            country,
            competitive_rating
          )
        )
      `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(extractRpcError(error, "Could not load tournament entries"));
  }

  return ((data ?? []) as TournamentEntryRow[]).map(mapTournamentEntry);
}

export async function getMyTournamentTeamInvitations(
  userId: string
): Promise<TournamentTeamInvitation[]> {
  const { data, error } = await supabase
    .from("tournament_entry_members")
    .select(
      `
        id,
        entry_id,
        created_at,
        updated_at,
        inviter:profiles!tournament_entry_members_invited_by_fkey(
          id,
          full_name,
          avatar_url,
          country,
          competitive_rating
        ),
        entry:tournament_entries!tournament_entry_members_entry_id_fkey(
          id,
          event_id,
          team_name,
          event:events!tournament_entries_event_id_fkey(
            id,
            title,
            type,
            mode,
            visibility,
            location_name,
            start_date,
            max_participants,
            status,
            created_by
          )
        )
      `
    )
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      extractRpcError(error, "Could not load tournament invitations")
    );
  }

  return ((data ?? []) as TournamentTeamInvitationRow[]).map(
    mapTournamentInvitation
  );
}

export async function createIndividualTournamentEntry(eventId: string) {
  const { error } = await supabase.rpc("create_individual_tournament_entry", {
    target_event_id: eventId,
  });

  if (error) {
    throw new Error(
      extractRpcError(error, "Could not join this tournament yet")
    );
  }
}

export async function createTeamTournamentEntry(
  eventId: string,
  teamName: string,
  invitedUserIds: string[]
) {
  const { error } = await supabase.rpc("create_team_tournament_entry", {
    target_event_id: eventId,
    target_team_name: teamName,
    invited_user_ids: invitedUserIds,
  });

  if (error) {
    throw new Error(
      extractRpcError(error, "Could not create the tournament team")
    );
  }
}

export async function acceptTournamentTeamInvitation(memberId: string) {
  const { error } = await supabase.rpc("accept_tournament_team_invitation", {
    target_member_id: memberId,
  });

  if (error) {
    throw new Error(
      extractRpcError(error, "Could not accept the tournament invitation")
    );
  }
}

export async function declineTournamentTeamInvitation(memberId: string) {
  const { error } = await supabase.rpc("decline_tournament_team_invitation", {
    target_member_id: memberId,
  });

  if (error) {
    throw new Error(
      extractRpcError(error, "Could not decline the tournament invitation")
    );
  }
}

export async function cancelTournamentEntry(entryId: string) {
  const { error } = await supabase.rpc("cancel_tournament_entry", {
    target_entry_id: entryId,
  });

  if (error) {
    throw new Error(
      extractRpcError(error, "Could not cancel this tournament registration")
    );
  }
}

export async function updateTournamentTeamName(
  entryId: string,
  teamName: string
) {
  const { error } = await supabase.rpc("update_tournament_team_name", {
    target_entry_id: entryId,
    target_team_name: teamName,
  });

  if (error) {
    throw new Error(
      extractRpcError(error, "Could not update the tournament team name")
    );
  }
}
