export type MatchTeam = "team_a" | "team_b";

export type MatchPlayerStatus = "joined" | "confirmed" | "left" | "removed";

export interface MatchPlayerProfile {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
}

export interface MatchPlayer {
    id: string;
    eventId: string;
    userId: string;
    team: MatchTeam | null;
    status: MatchPlayerStatus;
    joinedAt: string;
    updatedAt: string;
    profile: MatchPlayerProfile;
}
