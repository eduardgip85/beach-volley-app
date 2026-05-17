import type {
    AvailabilityStatus,
    PreferredLanguage,
    PreferredMatchMode,
} from "../../auth/types/auth.types";

export interface SettingsFormValues {
    fullName: string;
    username: string;
    avatarUrl: string;
    country: string;
    city: string;
    preferredLanguage: PreferredLanguage;
    preferredMatchMode: PreferredMatchMode;
    availabilityStatus: AvailabilityStatus;
}

export interface SettingsSectionStatus {
    loading: boolean;
    error: string;
    success: string;
}
