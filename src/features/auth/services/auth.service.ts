import { supabase } from "../../../config/supabase";
import type { UserProfile } from "../types/auth.types";
import {
    buildEmailConfirmationRedirectUrl,
    buildOAuthRedirectUrl,
    buildPasswordResetUrl,
    normalizeAuthRedirectPath,
} from "../utils/authRedirect.utils";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import {
    getPreferredAppLanguage,
    normalizePreferredLanguage,
} from "../../../i18n/detection";

const preferredPlayDays = new Set([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]);

interface RegisterData {
    email: string;
    password: string;
    fullName: string;
}

interface RegisterResult {
    requiresEmailVerification: boolean;
}

function normalizePreferredPlayDays(value: unknown): UserProfile["preferredPlayDays"] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter(
        (day): day is UserProfile["preferredPlayDays"][number] =>
            typeof day === "string" && preferredPlayDays.has(day)
    );
}

function mapProfile(profile: any): UserProfile {
    return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        username: profile.username ?? null,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        hasBall: profile.has_ball,
        hasNet: profile.has_net,
        equipmentVerified: profile.equipment_verified,
        equipmentVerifiedAt: profile.equipment_verified_at,
        competitiveRating: profile.competitive_rating ?? DEFAULT_COMPETITIVE_RATING,
        ratingGamesPlayed: profile.rating_games_played ?? 0,
        matchesPlayed: profile.matches_played ?? 0,
        wins: profile.wins ?? 0,
        losses: profile.losses ?? 0,
        country: profile.country ?? null,
        city: profile.city ?? null,
        currentStreak: profile.current_streak ?? 0,
        bestStreak: profile.best_streak ?? 0,
        availabilityStatus: profile.availability_status ?? null,
        profileVisibility: profile.profile_visibility ?? "public",
        showRating: profile.show_rating ?? true,
        showStats: profile.show_stats ?? true,
        preferredLanguage:
            normalizePreferredLanguage(profile.preferred_language) ?? "en",
        preferredMatchMode: profile.preferred_match_mode ?? null,
        preferredHand: profile.preferred_hand ?? null,
        preferredCourtSide: profile.preferred_court_side ?? null,
        preferredPlayDays: normalizePreferredPlayDays(profile.preferred_play_days),
        ratingPlacementCompletedAt: profile.rating_placement_completed_at ?? null,
        ratingPlacementEstimate:
            typeof profile.rating_placement_estimate === "number"
                ? profile.rating_placement_estimate
                : null,
        ratingPlacementScore:
            typeof profile.rating_placement_score === "number"
                ? profile.rating_placement_score
                : null,
        provisionalRatingMatchesRemaining:
            profile.provisional_rating_matches_remaining ?? 0,
    };
}

function getProfileNameFromUser(user: any) {
    const metadata = user.user_metadata ?? {};

    return (
        metadata.full_name ??
        metadata.name ??
        metadata.user_name ??
        user.email?.split("@")[0] ??
        "Beach Volley Player"
    );
}

function getProfileAvatarFromUser(user: any) {
    const metadata = user.user_metadata ?? {};

    return metadata.avatar_url ?? metadata.picture ?? null;
}

async function ensureProfileForUser(user: any) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) throw error;

    if (data) {
        return data;
    }

    const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
            id: user.id,
            full_name: getProfileNameFromUser(user),
            email: user.email ?? "",
            role: "player",
            avatar_url: getProfileAvatarFromUser(user),
            competitive_rating: DEFAULT_COMPETITIVE_RATING,
            preferred_language: getPreferredAppLanguage(),
        })
        .select("*")
        .single();

    if (insertError) throw insertError;

    return insertedProfile;
}

export async function registerUser({
    email,
    password,
    fullName,
}: RegisterData): Promise<RegisterResult> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: buildEmailConfirmationRedirectUrl("/profile"),
        },
    });

    if (authError) throw authError;

    const userId = authData.user?.id;

    if (!userId) {
        throw new Error("User could not be created");
    }

    const requiresEmailVerification = !authData.session;

    if (!requiresEmailVerification) {
        const { error: profileError } = await supabase.from("profiles").insert({
            id: userId,
            full_name: fullName,
            email,
            role: "player",
            competitive_rating: DEFAULT_COMPETITIVE_RATING,
            preferred_language: getPreferredAppLanguage(),
        });

        if (profileError) throw profileError;
    }

    return {
        requiresEmailVerification,
    };
}

export async function loginUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    return data;
}

export async function loginWithGoogle(redirectTo = "/events") {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: buildOAuthRedirectUrl(
                normalizeAuthRedirectPath(redirectTo)
            ),
        },
    });

    if (error) throw error;

    return data;
}

export async function requestPasswordReset(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildPasswordResetUrl(),
    });

    if (error) throw error;

    return data;
}

export async function updateRecoveredPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
        password,
    });

    if (error) throw error;

    return data;
}

export async function logoutUser() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    const user = session?.user;

    if (!user) return null;

    const profile = await ensureProfileForUser(user);

    return mapProfile(profile);
}
