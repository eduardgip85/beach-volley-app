import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
    getPreferredAppLanguage,
    normalizePreferredLanguage,
    persistLanguage,
    type AppLanguage,
} from "./detection";
import { resources } from "./resources";

i18n.use(initReactI18next).init({
    resources,
    lng: getPreferredAppLanguage(),
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
});

export async function setAppLanguage(
    language: string,
    options?: { persist?: boolean }
) {
    const normalizedLanguage = normalizePreferredLanguage(language) ?? "en";

    if (options?.persist !== false) {
        persistLanguage(normalizedLanguage);
    }

    if (i18n.language !== normalizedLanguage) {
        await i18n.changeLanguage(normalizedLanguage);
    }

    return normalizedLanguage;
}

export function getResolvedAppLanguage(profileLanguage?: string | null): AppLanguage {
    return getPreferredAppLanguage(profileLanguage);
}

export default i18n;
