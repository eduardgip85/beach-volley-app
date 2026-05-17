import { useEffect, useMemo, useState } from "react";
import type { UserProfile } from "../../auth/types/auth.types";
import { useAuth } from "../../auth/context/AuthContext";
import {
    changePassword,
    deleteCurrentAccount,
    logoutAllSessions,
    updateProfileSettings,
} from "../services/settings.service";
import {
    isKnownCity,
    isKnownCountry,
} from "../services/locationSuggestions.service";
import type { SettingsFormValues, SettingsSectionStatus } from "../types/settings.types";

const usernamePattern = /^[A-Za-z0-9_.-]{3,20}$/;

function buildInitialForm(profile: UserProfile): SettingsFormValues {
    return {
        fullName: profile.fullName,
        username: profile.username ?? "",
        avatarUrl: profile.avatarUrl ?? "",
        country: profile.country ?? "",
        city: profile.city ?? "",
        preferredLanguage: profile.preferredLanguage,
        preferredMatchMode: profile.preferredMatchMode,
        availabilityStatus: profile.availabilityStatus,
    };
}

function emptyStatus(): SettingsSectionStatus {
    return {
        loading: false,
        error: "",
        success: "",
    };
}

export function useSettings(profile: UserProfile | null) {
    const { refreshProfile } = useAuth();
    const [form, setForm] = useState<SettingsFormValues | null>(
        profile ? buildInitialForm(profile) : null
    );
    const [profileStatus, setProfileStatus] = useState<SettingsSectionStatus>(
        emptyStatus()
    );
    const [locationStatus, setLocationStatus] = useState<SettingsSectionStatus>(
        emptyStatus()
    );
    const [preferencesStatus, setPreferencesStatus] =
        useState<SettingsSectionStatus>(emptyStatus());
    const [accountStatus, setAccountStatus] = useState<SettingsSectionStatus>(
        emptyStatus()
    );

    useEffect(() => {
        if (!profile) {
            setForm(null);
            return;
        }

        setForm(buildInitialForm(profile));
    }, [profile]);

    const canManage = Boolean(profile && form);

    const hasUnsavedProfile = useMemo(() => {
        if (!profile || !form) return false;

        return (
            form.fullName !== profile.fullName ||
            form.username !== (profile.username ?? "") ||
            form.avatarUrl !== (profile.avatarUrl ?? "")
        );
    }, [form, profile]);

    function updateField<K extends keyof SettingsFormValues>(
        key: K,
        value: SettingsFormValues[K]
    ) {
        setForm((current) =>
            current
                ? {
                      ...current,
                      [key]: value,
                  }
                : current
        );
    }

    function validateProfileSection() {
        if (!form) {
            return "Profile is not ready yet";
        }

        if (!form.fullName.trim()) {
            return "Full name is required";
        }

        if (form.username.trim() && !usernamePattern.test(form.username.trim())) {
            return "Username must be 3-20 characters and use letters, numbers, dots, dashes or underscores";
        }

        if (form.avatarUrl.trim()) {
            const trimmedAvatarUrl = form.avatarUrl.trim();

            if (!trimmedAvatarUrl.startsWith("data:image/")) {
                try {
                    new URL(trimmedAvatarUrl);
                } catch {
                    return "Avatar image could not be validated";
                }
            }
        }

        return "";
    }

    async function saveProfileSection() {
        if (!profile || !form) return;

        const validationError = validateProfileSection();

        if (validationError) {
            setProfileStatus({
                loading: false,
                error: validationError,
                success: "",
            });
            return;
        }

        try {
            setProfileStatus({
                loading: true,
                error: "",
                success: "",
            });

            await updateProfileSettings({
                userId: profile.id,
                fullName: form.fullName,
                username: form.username,
                avatarUrl: form.avatarUrl,
            });
            await refreshProfile();

            setProfileStatus({
                loading: false,
                error: "",
                success: "Profile updated",
            });
        } catch (error) {
            setProfileStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not update profile",
                success: "",
            });
        }
    }

    async function saveLocationSection() {
        if (!profile || !form) return;

        const trimmedCountry = form.country.trim();
        const trimmedCity = form.city.trim();

        if (trimmedCountry && !isKnownCountry(trimmedCountry)) {
            setLocationStatus({
                loading: false,
                error: "Please choose a real country from the suggestions",
                success: "",
            });
            return;
        }

        if (trimmedCity && !trimmedCountry) {
            setLocationStatus({
                loading: false,
                error: "Choose a country before setting a city",
                success: "",
            });
            return;
        }

        try {
            setLocationStatus({
                loading: true,
                error: "",
                success: "",
            });

            if (trimmedCity) {
                const cityExists = await isKnownCity(trimmedCity, trimmedCountry);

                if (!cityExists) {
                    setLocationStatus({
                        loading: false,
                        error: "Please choose a real city from the suggestions",
                        success: "",
                    });
                    return;
                }
            }

            await updateProfileSettings({
                userId: profile.id,
                country: form.country,
                city: form.city,
            });
            await refreshProfile();

            setLocationStatus({
                loading: false,
                error: "",
                success: "Location updated",
            });
        } catch (error) {
            setLocationStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not update location",
                success: "",
            });
        }
    }

    async function savePreferencesSection() {
        if (!profile || !form) return;

        try {
            setPreferencesStatus({
                loading: true,
                error: "",
                success: "",
            });

            await updateProfileSettings({
                userId: profile.id,
                preferredLanguage: form.preferredLanguage,
                preferredMatchMode: form.preferredMatchMode,
                availabilityStatus: form.availabilityStatus,
            });
            await refreshProfile();

            setPreferencesStatus({
                loading: false,
                error: "",
                success: "Preferences updated",
            });
        } catch (error) {
            setPreferencesStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not update preferences",
                success: "",
            });
        }
    }

    async function updatePassword(newPassword: string, confirmPassword: string) {
        if (newPassword.length < 8) {
            setAccountStatus({
                loading: false,
                error: "Password must be at least 8 characters long",
                success: "",
            });
            return false;
        }

        if (newPassword !== confirmPassword) {
            setAccountStatus({
                loading: false,
                error: "Passwords do not match",
                success: "",
            });
            return false;
        }

        try {
            setAccountStatus({
                loading: true,
                error: "",
                success: "",
            });
            await changePassword(newPassword);
            setAccountStatus({
                loading: false,
                error: "",
                success: "Password updated",
            });
            return true;
        } catch (error) {
            setAccountStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not update password",
                success: "",
            });
            return false;
        }
    }

    async function logoutEverywhere() {
        try {
            setAccountStatus({
                loading: true,
                error: "",
                success: "",
            });
            await logoutAllSessions();
            setAccountStatus({
                loading: false,
                error: "",
                success: "All sessions closed",
            });
            return true;
        } catch (error) {
            setAccountStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not log out all sessions",
                success: "",
            });
            return false;
        }
    }

    async function removeAccount(confirmationText: string) {
        if (confirmationText.trim().toUpperCase() !== "DELETE") {
            setAccountStatus({
                loading: false,
                error: 'Type "DELETE" to confirm account deletion',
                success: "",
            });
            return false;
        }

        try {
            setAccountStatus({
                loading: true,
                error: "",
                success: "",
            });
            await deleteCurrentAccount();
            setAccountStatus({
                loading: false,
                error: "",
                success: "Account deleted",
            });
            return true;
        } catch (error) {
            setAccountStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not delete account",
                success: "",
            });
            return false;
        }
    }

    return {
        canManage,
        form,
        updateField,
        hasUnsavedProfile,
        statuses: {
            profile: profileStatus,
            location: locationStatus,
            preferences: preferencesStatus,
            account: accountStatus,
        },
        actions: {
            saveProfileSection,
            saveLocationSection,
            savePreferencesSection,
            updatePassword,
            logoutEverywhere,
            removeAccount,
        },
    };
}
