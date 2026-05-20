export type UserRole = "player" | "admin";
export type ProfileVisibility = "public" | "private";
export type AvailabilityStatus =
    | "available"
    | "looking_for_match"
    | "busy"
    | "offline"
    | null;
export type PreferredMatchMode = "casual" | "competitive" | null;
export type PreferredLanguage = "en" | "es";
export type PreferredHand = "right" | "left" | "both" | null;
export type PreferredCourtSide = "right" | "left" | "both" | null;
export type PreferredPlayDay =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    username: string | null;
    role: UserRole;
    avatarUrl: string | null;
    createdAt: string;
    hasBall: boolean;
    hasNet: boolean;
    equipmentVerified: boolean;
    equipmentVerifiedAt: string | null;
    competitiveRating: number;
    ratingGamesPlayed: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    country: string | null;
    city: string | null;
    currentStreak: number;
    bestStreak: number;
    availabilityStatus: AvailabilityStatus;
    profileVisibility: ProfileVisibility;
    showRating: boolean;
    showStats: boolean;
    preferredLanguage: PreferredLanguage;
    preferredMatchMode: PreferredMatchMode;
    preferredHand: PreferredHand;
    preferredCourtSide: PreferredCourtSide;
    preferredPlayDays: PreferredPlayDay[];
    ratingPlacementCompletedAt: string | null;
    ratingPlacementEstimate: number | null;
    ratingPlacementScore: number | null;
    provisionalRatingMatchesRemaining: number;
}
