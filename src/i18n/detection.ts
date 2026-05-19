export const LANGUAGE_STORAGE_KEY = "beach-volley-app-language";

export const supportedLanguages = ["en", "es"] as const;

export type AppLanguage = (typeof supportedLanguages)[number];

function isSupportedLanguage(value: string): value is AppLanguage {
    return supportedLanguages.includes(value as AppLanguage);
}

export function normalizePreferredLanguage(
    value?: string | null
): AppLanguage | null {
    if (!value) {
        return null;
    }

    const normalized = value.trim().toLowerCase();

    if (isSupportedLanguage(normalized)) {
        return normalized;
    }

    if (normalized.startsWith("es") || normalized.startsWith("ca")) {
        return "es";
    }

    if (normalized.startsWith("en")) {
        return "en";
    }

    return null;
}

export function getStoredLanguage(): AppLanguage | null {
    if (typeof window === "undefined") {
        return null;
    }

    return normalizePreferredLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function persistLanguage(language: AppLanguage) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export function detectBrowserLanguage(): AppLanguage {
    if (typeof window === "undefined") {
        return "en";
    }

    const localeCandidates = [
        ...(window.navigator.languages ?? []),
        window.navigator.language,
    ].filter(Boolean);

    const hasSpanishLocale = localeCandidates.some((locale) => {
        const normalized = locale.toLowerCase();
        return normalized === "es" || normalized.startsWith("es-") || normalized.endsWith("-es");
    });

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone?.toLowerCase() ?? "";
    const isSpainTimezone =
        timezone === "europe/madrid" || timezone === "atlantic/canary";

    return hasSpanishLocale || isSpainTimezone ? "es" : "en";
}

export function getPreferredAppLanguage(
    profileLanguage?: string | null
): AppLanguage {
    return (
        normalizePreferredLanguage(profileLanguage) ??
        getStoredLanguage() ??
        detectBrowserLanguage()
    );
}
