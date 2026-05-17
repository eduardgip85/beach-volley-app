import type { ProfileVisibility } from "../../auth/types/auth.types";
import type { SettingsSectionStatus } from "../types/settings.types";

interface PrivacySettingsFormProps {
    profileVisibility: ProfileVisibility;
    showRating: boolean;
    showStats: boolean;
    status: SettingsSectionStatus;
    onProfileVisibilityChange: (value: ProfileVisibility) => void;
    onShowRatingChange: (value: boolean) => void;
    onShowStatsChange: (value: boolean) => void;
    onSave: () => void;
}

export function PrivacySettingsForm({
    profileVisibility,
    showRating,
    showStats,
    status,
    onProfileVisibilityChange,
    onShowRatingChange,
    onShowStatsChange,
    onSave,
}: PrivacySettingsFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <label className="block md:col-span-1">
                    <span className="text-sm font-semibold text-slate-700">
                        Profile visibility
                    </span>
                    <select
                        value={profileVisibility}
                        onChange={(event) =>
                            onProfileVisibilityChange(
                                event.target.value as ProfileVisibility
                            )
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:col-span-1">
                    <input
                        type="checkbox"
                        checked={showRating}
                        onChange={(event) => onShowRatingChange(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <div>
                        <p className="font-semibold text-slate-900">Show rating</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Let other players see your competitive rating on your public
                            profile.
                        </p>
                    </div>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:col-span-1">
                    <input
                        type="checkbox"
                        checked={showStats}
                        onChange={(event) => onShowStatsChange(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <div>
                        <p className="font-semibold text-slate-900">Show statistics</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Show recent match summaries and public performance stats.
                        </p>
                    </div>
                </label>
            </div>

            <SectionFeedback status={status} />

            <button
                type="button"
                onClick={onSave}
                disabled={status.loading}
                className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
            >
                {status.loading ? "Saving..." : "Save privacy"}
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
