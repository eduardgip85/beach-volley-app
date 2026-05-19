import type { PreferredLanguage } from "../../auth/types/auth.types";

export interface SettingsFormValues {
    fullName: string;
    avatarUrl: string;
    country: string;
    city: string;
    preferredLanguage: PreferredLanguage;
}

export interface SettingsSectionStatus {
    loading: boolean;
    error: string;
    success: string;
}
