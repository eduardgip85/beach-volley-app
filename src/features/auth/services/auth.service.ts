import { supabase } from "../../../config/supabase";
import type { UserProfile } from "../types/auth.types";
import { buildOAuthRedirectUrl, normalizeAuthRedirectPath } from "../utils/authRedirect.utils";

interface RegisterData {
    email: string;
    password: string;
    fullName: string;
}

function mapProfile(profile: any): UserProfile {
    return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        hasBall: profile.has_ball,
        hasNet: profile.has_net,
        equipmentVerified: profile.equipment_verified,
        equipmentVerifiedAt: profile.equipment_verified_at,
        competitiveRating: profile.competitive_rating ?? 1000,
        matchesPlayed: profile.matches_played ?? 0,
        wins: profile.wins ?? 0,
        losses: profile.losses ?? 0,
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
}: RegisterData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) throw authError;

    const userId = authData.user?.id;

    if (!userId) {
        throw new Error("User could not be created");
    }

    const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        email,
        role: "player",
    });

    if (profileError) throw profileError;

    return authData;
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
