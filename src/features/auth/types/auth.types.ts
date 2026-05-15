export type UserRole = "player" | "admin";

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    avatarUrl: string | null;
    createdAt: string;
    hasBall: boolean;
    hasNet: boolean;
    equipmentVerified: boolean;
    equipmentVerifiedAt: string | null;
    competitiveRating: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
}
