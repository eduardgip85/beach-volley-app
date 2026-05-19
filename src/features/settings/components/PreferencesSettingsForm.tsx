import type { PreferredLanguage } from "../../auth/types/auth.types";
import { useTranslation } from "react-i18next";
import type { SettingsSectionStatus } from "../types/settings.types";

interface PreferencesSettingsFormProps {
    preferredLanguage: PreferredLanguage;
    status: SettingsSectionStatus;
    onPreferredLanguageChange: (value: PreferredLanguage) => void;
    onSave: () => void;
}

export function PreferencesSettingsForm({
    preferredLanguage,
    status,
    onPreferredLanguageChange,
    onSave,
}: PreferencesSettingsFormProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                        {t("settings.preferences.language")}
                    </span>
                    <select
                        value={preferredLanguage}
                        onChange={(event) =>
                            onPreferredLanguageChange(
                                event.target.value as PreferredLanguage
                            )
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                        <option value="en">{t("settings.preferences.english")}</option>
                        <option value="es">{t("settings.preferences.spanish")}</option>
                    </select>
                    <p className="mt-2 text-xs text-slate-500">
                        {t("settings.preferences.help")}
                    </p>
                </label>
            </div>

            <SectionFeedback status={status} />

            <button
                type="button"
                onClick={onSave}
                disabled={status.loading}
                className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
            >
                {status.loading
                    ? t("settings.preferences.saving")
                    : t("settings.preferences.save")}
            </button>
        </div>
    );
}

function SectionFeedback({ status }: { status: SettingsSectionStatus }) {
    if (status.error) {
        return (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {status.error}
            </p>
        );
    }

    if (status.success) {
        return (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {status.success}
            </p>
        );
    }

    return null;
}
