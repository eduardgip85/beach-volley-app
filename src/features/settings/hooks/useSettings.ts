import { useEffect, useState } from "react";
import i18n, { setAppLanguage } from "../../../i18n";
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

function buildInitialForm(profile: UserProfile): SettingsFormValues {
    return {
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl ?? "",
        country: profile.country ?? "",
        city: profile.city ?? "",
        preferredLanguage: profile.preferredLanguage,
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
            return i18n.t("settings.messages.profileNotReady");
        }

        if (!form.fullName.trim()) {
            return i18n.t("settings.messages.fullNameRequired");
        }

        if (form.avatarUrl.trim()) {
            const trimmedAvatarUrl = form.avatarUrl.trim();

            if (!trimmedAvatarUrl.startsWith("data:image/")) {
                try {
                    new URL(trimmedAvatarUrl);
                } catch {
                    return i18n.t("settings.messages.avatarInvalid");
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
                avatarUrl: form.avatarUrl,
            });
            await refreshProfile();

            setProfileStatus({
                loading: false,
                error: "",
                success: i18n.t("settings.messages.profileUpdated"),
            });
        } catch (error) {
            setProfileStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : i18n.t("settings.messages.profileUpdateError"),
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
                error: i18n.t("settings.messages.realCountryRequired"),
                success: "",
            });
            return;
        }

        if (trimmedCity && !trimmedCountry) {
            setLocationStatus({
                loading: false,
                error: i18n.t("settings.messages.chooseCountryFirst"),
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
                        error: i18n.t("settings.messages.realCityRequired"),
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
                success: i18n.t("settings.messages.locationUpdated"),
            });
        } catch (error) {
            setLocationStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : i18n.t("settings.messages.locationUpdateError"),
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
            });
            await setAppLanguage(form.preferredLanguage);
            await refreshProfile();

            setPreferencesStatus({
                loading: false,
                error: "",
                success: i18n.t("settings.messages.preferencesUpdated"),
            });
        } catch (error) {
            setPreferencesStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : i18n.t("settings.messages.preferencesUpdateError"),
                success: "",
            });
        }
    }

    async function updatePassword(newPassword: string, confirmPassword: string) {
        if (newPassword.length < 8) {
            setAccountStatus({
                loading: false,
                error: i18n.t("settings.messages.passwordTooShort"),
                success: "",
            });
            return false;
        }

        if (newPassword !== confirmPassword) {
            setAccountStatus({
                loading: false,
                error: i18n.t("settings.messages.passwordsDoNotMatch"),
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
                success: i18n.t("settings.messages.passwordUpdated"),
            });
            return true;
        } catch (error) {
            setAccountStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : i18n.t("settings.messages.passwordUpdateError"),
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
                success: i18n.t("settings.messages.sessionsClosed"),
            });
            return true;
        } catch (error) {
            setAccountStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : i18n.t("settings.messages.sessionsCloseError"),
                success: "",
            });
            return false;
        }
    }

    async function removeAccount(confirmationText: string) {
        if (confirmationText.trim().toUpperCase() !== "DELETE") {
            setAccountStatus({
                loading: false,
                error: i18n.t("settings.messages.deleteKeywordRequired"),
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
                success: i18n.t("settings.messages.accountDeleted"),
            });
            return true;
        } catch (error) {
            setAccountStatus({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : i18n.t("settings.messages.accountDeleteError"),
                success: "",
            });
            return false;
        }
    }

    return {
        canManage,
        form,
        updateField,
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
