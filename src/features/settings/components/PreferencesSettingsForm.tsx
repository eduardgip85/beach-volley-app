import type {
    AvailabilityStatus,
    PreferredLanguage,
    PreferredMatchMode,
} from "../../auth/types/auth.types";
import type { SettingsSectionStatus } from "../types/settings.types";

interface PreferencesSettingsFormProps {
    preferredLanguage: PreferredLanguage;
    preferredMatchMode: PreferredMatchMode;
    availabilityStatus: AvailabilityStatus;
    status: SettingsSectionStatus;
    onPreferredLanguageChange: (value: PreferredLanguage) => void;
    onPreferredMatchModeChange: (value: PreferredMatchMode) => void;
    onAvailabilityStatusChange: (value: AvailabilityStatus) => void;
    onSave: () => void;
}

export function PreferencesSettingsForm({
    preferredLanguage,
    preferredMatchMode,
    availabilityStatus,
    status,
    onPreferredLanguageChange,
    onPreferredMatchModeChange,
    onAvailabilityStatusChange,
    onSave,
}: PreferencesSettingsFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Language</span>
                    <select
                        value={preferredLanguage}
                        onChange={(event) =>
                            onPreferredLanguageChange(
                                event.target.value as PreferredLanguage
                            )
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                        <option value="en">English</option>
                        <option value="es" disabled>
                            Spanish (coming soon)
                        </option>
                    </select>
                    <p className="mt-2 text-xs text-slate-500">
                        The app is still English-only for now. Spanish is the next
                        language planned.
                    </p>
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                        Match preference
                    </span>
                    <select
                        value={preferredMatchMode ?? ""}
                        onChange={(event) =>
                            onPreferredMatchModeChange(
                                (event.target.value || null) as PreferredMatchMode
                            )
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                        <option value="">No preference</option>
                        <option value="casual">Casual</option>
                        <option value="competitive">Competitive</option>
                    </select>
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                        Availability
                    </span>
                    <select
                        value={availabilityStatus ?? ""}
                        onChange={(event) =>
                            onAvailabilityStatusChange(
                                (event.target.value || null) as AvailabilityStatus
                            )
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                        <option value="">Not set</option>
                        <option value="available">Available</option>
                        <option value="looking_for_match">Looking for match</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                    </select>
                </label>
            </div>

            <SectionFeedback status={status} />

            <button
                type="button"
                onClick={onSave}
                disabled={status.loading}
                className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
            >
                {status.loading ? "Saving..." : "Save preferences"}
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
