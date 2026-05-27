import type { InvitationEventSummary } from "../../event-invitations/types/eventInvitation.types";

export type TournamentEntryStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "expired";

export type TournamentEntryMemberStatus =
  | "accepted"
  | "pending"
  | "declined"
  | "cancelled"
  | "expired";

export interface TournamentEntryMemberProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  country: string | null;
  competitiveRating: number;
}

export interface TournamentEntryMember {
  id: string;
  entryId: string;
  userId: string;
  invitedBy: string;
  status: TournamentEntryMemberStatus;
  createdAt: string;
  updatedAt: string;
  profile: TournamentEntryMemberProfile;
}

export interface TournamentEntry {
  id: string;
  eventId: string;
  captainId: string;
  registrationType: "individual" | "team";
  entryKind: "registration" | "balanced_team";
  teamName: string | null;
  status: TournamentEntryStatus;
  generatedTeamNumber?: number | null;
  createdAt: string;
  updatedAt: string;
  members: TournamentEntryMember[];
}

export interface TournamentTeamInvitation {
  memberId: string;
  entryId: string;
  eventId: string;
  teamName: string | null;
  createdAt: string;
  updatedAt: string;
  inviter: TournamentEntryMemberProfile;
  event: InvitationEventSummary;
}
