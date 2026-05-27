export type TournamentBracketMatchState =
  | "ready"
  | "pending"
  | "bye"
  | "empty"
  | "completed";

export type TournamentBracketStageType =
  | "main"
  | "group"
  | "knockout"
  | "winner_bracket"
  | "loser_bracket"
  | "grand_final";

export interface TournamentBracketMatchSet {
  id: string;
  bracketMatchId: string;
  setNumber: number;
  sideAScore: number;
  sideBScore: number;
}

export interface TournamentBracketMatch {
  id: string;
  eventId: string;
  roundNumber: number;
  matchNumber: number;
  sourceMatchAId: string | null;
  sourceMatchBId: string | null;
  sideAEntryId: string | null;
  sideBEntryId: string | null;
  winnerEntryId: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  courtNumber: number | null;
  refereeEntryId: string | null;
  stageType: TournamentBracketStageType;
  groupLabel: string | null;
  sets: TournamentBracketMatchSet[];
  state: TournamentBracketMatchState;
  createdAt: string;
  updatedAt: string;
}
