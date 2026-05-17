export type RankingScope = "global" | "country" | "friends";

export interface RankingPlayer {
    position: number;
    profileId: string;
    fullName: string;
    avatarUrl: string | null;
    country: string | null;
    city: string | null;
    competitiveRating: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    currentStreak: number;
    bestStreak: number;
}

export interface RatingHistoryPoint {
    id: string;
    profileId: string;
    rating: number;
    matchId: string | null;
    createdAt: string;
}
