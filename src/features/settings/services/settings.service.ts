import { supabase } from "../../../config/supabase";
import type {
    AvailabilityStatus,
    PreferredLanguage,
    PreferredMatchMode,
} from "../../auth/types/auth.types";

interface ProfileSettingsUpdate {
    userId: string;
    fullName?: string;
    username?: string | null;
    avatarUrl?: string | null;
    country?: string | null;
    city?: string | null;
    preferredLanguage?: PreferredLanguage;
    preferredMatchMode?: PreferredMatchMode;
    availabilityStatus?: AvailabilityStatus;
}

function normalizeString(value?: string | null) {
    if (value == null) {
        return undefined;
    }

    const normalized = value.trim();
    return normalized ? normalized : null;
}

function handleProfileUpdateError(error: any): never {
    if (error?.code === "23505") {
        throw new Error("This username is already taken");
    }

    throw error;
}

export async function updateProfileSettings({
    userId,
    fullName,
    username,
    avatarUrl,
    country,
    city,
    preferredLanguage,
    preferredMatchMode,
    availabilityStatus,
}: ProfileSettingsUpdate) {
    const payload = {
        ...(fullName !== undefined ? { full_name: fullName.trim() } : {}),
        ...(username !== undefined ? { username: normalizeString(username) } : {}),
        ...(avatarUrl !== undefined ? { avatar_url: normalizeString(avatarUrl) } : {}),
        ...(country !== undefined ? { country: normalizeString(country) } : {}),
        ...(city !== undefined ? { city: normalizeString(city) } : {}),
        ...(preferredLanguage !== undefined
            ? { preferred_language: preferredLanguage }
            : {}),
        ...(preferredMatchMode !== undefined
            ? { preferred_match_mode: preferredMatchMode }
            : {}),
        ...(availabilityStatus !== undefined
            ? { availability_status: availabilityStatus }
            : {}),
    };

    const { error } = await supabase.from("profiles").update(payload).eq("id", userId);

    if (error) {
        handleProfileUpdateError(error);
    }
}

export async function changePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) throw error;
}

export async function logoutAllSessions() {
    const { error } = await supabase.auth.signOut({
        scope: "global",
    });

    if (error) throw error;
}

export async function deleteCurrentAccount() {
    const { data, error } = await supabase.functions.invoke("delete-account", {
        body: {},
    });

    if (error) throw error;

    await supabase.auth.signOut({
        scope: "local",
    });

    return data;
}
