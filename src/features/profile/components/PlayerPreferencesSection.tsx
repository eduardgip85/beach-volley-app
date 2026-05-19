import { CalendarDays, Clock3, MapPin, Trophy, Volleyball, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/context/AuthContext";
import type {
    AvailabilityStatus,
    PreferredCourtSide,
    PreferredHand,
    PreferredMatchMode,
    PreferredPlayDay,
    UserProfile,
} from "../../auth/types/auth.types";
import { updateProfileSettings } from "../../settings/services/settings.service";

interface PlayerPreferencesSectionProps {
    profile: UserProfile;
}

const playDayOptions: PreferredPlayDay[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

function buildInitialState(profile: UserProfile) {
    return {
        preferredHand: profile.preferredHand,
        preferredCourtSide: profile.preferredCourtSide,
        preferredMatchMode: profile.preferredMatchMode,
        availabilityStatus: profile.availabilityStatus,
        preferredPlayDays: profile.preferredPlayDays,
    };
}

export function PlayerPreferencesSection({
    profile,
}: PlayerPreferencesSectionProps) {
    const { t } = useTranslation();
    const { refreshProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [state, setState] = useState(buildInitialState(profile));

    useEffect(() => {
        setState(buildInitialState(profile));
    }, [profile]);

    const scheduleSummary = useMemo(() => {
        if (state.preferredPlayDays.length === 0) {
            return t("profile.preferences.notSet");
        }

        return state.preferredPlayDays
            .map((day) => t(`profile.preferences.days.${day}`))
            .join(", ");
    }, [state.preferredPlayDays, t]);

    function updateField<K extends keyof typeof state>(key: K, value: (typeof state)[K]) {
        setState((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function togglePlayDay(day: PreferredPlayDay) {
        setState((current) => ({
            ...current,
            preferredPlayDays: current.preferredPlayDays.includes(day)
                ? current.preferredPlayDays.filter((value) => value !== day)
                : [...current.preferredPlayDays, day],
        }));
    }

    async function handleSave() {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await updateProfileSettings({
                userId: profile.id,
                preferredHand: state.preferredHand,
                preferredCourtSide: state.preferredCourtSide,
                preferredMatchMode: state.preferredMatchMode,
                availabilityStatus: state.availabilityStatus,
                preferredPlayDays: state.preferredPlayDays,
            });
            await refreshProfile();

            setSuccess(t("profile.preferences.saved"));
            setIsOpen(false);
        } catch (saveError) {
            console.error(saveError);
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : t("profile.preferences.saveError")
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6 md:p-8">
                <div className="mb-5">
                    <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                        {t("profile.preferences.title")}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("profile.preferences.body")}
                    </p>
                </div>

                <div className="space-y-3">
                    <PreferenceCard
                        icon={<Volleyball size={18} />}
                        label={t("profile.preferences.preferredHand")}
                        value={getOptionLabel("hand", state.preferredHand, t)}
                        onClick={() => setIsOpen(true)}
                    />
                    <PreferenceCard
                        icon={<MapPin size={18} />}
                        label={t("profile.preferences.courtSide")}
                        value={getOptionLabel("courtSide", state.preferredCourtSide, t)}
                        onClick={() => setIsOpen(true)}
                    />
                    <PreferenceCard
                        icon={<Trophy size={18} />}
                        label={t("profile.preferences.matchType")}
                        value={getOptionLabel("matchType", state.preferredMatchMode, t)}
                        onClick={() => setIsOpen(true)}
                    />
                    <PreferenceCard
                        icon={<Clock3 size={18} />}
                        label={t("profile.preferences.availability")}
                        value={getOptionLabel("availability", state.availabilityStatus, t)}
                        onClick={() => setIsOpen(true)}
                    />
                    <PreferenceCard
                        icon={<CalendarDays size={18} />}
                        label={t("profile.preferences.schedule")}
                        value={scheduleSummary}
                        onClick={() => setIsOpen(true)}
                    />
                </div>

                {error ? (
                    <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                ) : null}

                {success ? (
                    <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {success}
                    </p>
                ) : null}
            </section>

            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
                    <div className="w-full max-w-2xl rounded-[2rem] bg-white p-5 shadow-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">
                                    {t("profile.preferences.sheetTitle")}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    {t("profile.preferences.sheetBody")}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-2xl bg-slate-100 p-2 text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <PreferenceSelect
                                label={t("profile.preferences.preferredHand")}
                                value={state.preferredHand ?? ""}
                                onChange={(value) =>
                                    updateField("preferredHand", (value || null) as PreferredHand)
                                }
                                options={[
                                    ["", t("profile.preferences.notSet")],
                                    ["right", t("profile.preferences.options.right")],
                                    ["left", t("profile.preferences.options.left")],
                                    ["both", t("profile.preferences.options.bothHands")],
                                ]}
                            />

                            <PreferenceSelect
                                label={t("profile.preferences.courtSide")}
                                value={state.preferredCourtSide ?? ""}
                                onChange={(value) =>
                                    updateField(
                                        "preferredCourtSide",
                                        (value || null) as PreferredCourtSide
                                    )
                                }
                                options={[
                                    ["", t("profile.preferences.notSet")],
                                    ["right", t("profile.preferences.options.rightSide")],
                                    ["left", t("profile.preferences.options.leftSide")],
                                    ["both", t("profile.preferences.options.bothSides")],
                                ]}
                            />

                            <PreferenceSelect
                                label={t("profile.preferences.matchType")}
                                value={state.preferredMatchMode ?? ""}
                                onChange={(value) =>
                                    updateField(
                                        "preferredMatchMode",
                                        (value || null) as PreferredMatchMode
                                    )
                                }
                                options={[
                                    ["", t("profile.preferences.notSet")],
                                    ["casual", t("settings.preferences.casual")],
                                    ["competitive", t("settings.preferences.competitive")],
                                ]}
                            />

                            <PreferenceSelect
                                label={t("profile.preferences.availability")}
                                value={state.availabilityStatus ?? ""}
                                onChange={(value) =>
                                    updateField(
                                        "availabilityStatus",
                                        (value || null) as AvailabilityStatus
                                    )
                                }
                                options={[
                                    ["", t("profile.preferences.notSet")],
                                    ["available", t("settings.preferences.available")],
                                    [
                                        "looking_for_match",
                                        t("settings.preferences.lookingForMatch"),
                                    ],
                                    ["busy", t("settings.preferences.busy")],
                                    ["offline", t("settings.preferences.offline")],
                                ]}
                            />
                        </div>

                        <div className="mt-6">
                            <p className="text-sm font-semibold text-slate-700">
                                {t("profile.preferences.schedule")}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {playDayOptions.map((day) => {
                                    const isSelected = state.preferredPlayDays.includes(day);

                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => togglePlayDay(day)}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                isSelected
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {t(`profile.preferences.days.${day}`)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {error ? (
                            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </p>
                        ) : null}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60"
                            >
                                {saving
                                    ? t("profile.preferences.saving")
                                    : t("profile.preferences.save")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

function PreferenceCard({
    icon,
    label,
    value,
    onClick,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-blue-200 hover:bg-slate-50"
        >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                {icon}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm text-slate-500">{label}</span>
                <span className="mt-1 block truncate text-lg font-bold text-slate-900">
                    {value}
                </span>
            </span>
        </button>
    );
}

function PreferenceSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<[string, string]>;
}) {
    return (
        <label className="block">
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            >
                {options.map(([optionValue, optionLabel]) => (
                    <option key={`${label}-${optionValue || "empty"}`} value={optionValue}>
                        {optionLabel}
                    </option>
                ))}
            </select>
        </label>
    );
}

function getOptionLabel(
    kind: "hand" | "courtSide" | "matchType" | "availability",
    value: string | null,
    t: (key: string) => string
) {
    if (!value) {
        return t("profile.preferences.notSet");
    }

    if (kind === "hand") {
        return t(`profile.preferences.options.${value === "both" ? "bothHands" : value}`);
    }

    if (kind === "courtSide") {
        if (value === "right") {
            return t("profile.preferences.options.rightSide");
        }

        if (value === "left") {
            return t("profile.preferences.options.leftSide");
        }

        return t("profile.preferences.options.bothSides");
    }

    if (kind === "matchType") {
        return value === "competitive"
            ? t("settings.preferences.competitive")
            : t("settings.preferences.casual");
    }

    return t(`settings.preferences.${value === "looking_for_match" ? "lookingForMatch" : value}`);
}
