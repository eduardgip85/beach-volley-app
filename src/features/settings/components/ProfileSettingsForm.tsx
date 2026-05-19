import { ImagePlus, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SettingsSectionStatus } from "../types/settings.types";
import { readAvatarFileAsDataUrl } from "../utils/avatar.utils";

interface ProfileSettingsFormProps {
    fullName: string;
    avatarUrl: string;
    status: SettingsSectionStatus;
    onFullNameChange: (value: string) => void;
    onAvatarUrlChange: (value: string) => void;
    onSave: () => void;
}

export function ProfileSettingsForm({
    fullName,
    avatarUrl,
    status,
    onFullNameChange,
    onAvatarUrlChange,
    onSave,
}: ProfileSettingsFormProps) {
    const { t } = useTranslation();
    const [uploadError, setUploadError] = useState("");

    async function handleAvatarFileChange(file?: File) {
        if (!file) {
            return;
        }

        try {
            setUploadError("");
            const dataUrl = await readAvatarFileAsDataUrl(file);
            onAvatarUrlChange(dataUrl);
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : t("settings.messages.avatarLoadError")
            );
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                        {t("settings.profile.fullName")}
                    </span>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <UserRound size={18} className="text-slate-400" />
                        <input
                            value={fullName}
                            onChange={(event) => onFullNameChange(event.target.value)}
                            className="w-full bg-transparent text-sm text-slate-900 outline-none"
                            placeholder={t("settings.profile.fullNamePlaceholder")}
                        />
                    </div>
                </label>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-700">
                        {t("settings.profile.avatarImage")}
                    </span>

                    {avatarUrl.trim() ? (
                        <button
                            type="button"
                            onClick={() => onAvatarUrlChange("")}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"
                        >
                            <Trash2 size={14} />
                            {t("settings.profile.remove")}
                        </button>
                    ) : null}
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center hover:bg-slate-100">
                    {avatarUrl.trim() ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar preview"
                            className="h-24 w-24 rounded-[1.5rem] object-cover"
                        />
                    ) : (
                        <div className="rounded-2xl bg-white p-4 text-slate-500 shadow-sm">
                            <ImagePlus size={26} />
                        </div>
                    )}

                    <p className="mt-4 text-sm font-bold text-slate-900">
                        {t("settings.profile.uploadAvatar")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {t("settings.profile.uploadHint")}
                    </p>

                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                        onChange={(event) =>
                            handleAvatarFileChange(event.target.files?.[0])
                        }
                    />
                </label>

                {uploadError ? (
                    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {uploadError}
                    </p>
                ) : null}

                {avatarUrl.trim() ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                        {t("settings.profile.avatarWithImage")}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                        {t("settings.profile.avatarWithoutImage")}
                    </div>
                )}
            </div>

            <SectionFeedback status={status} />

            <div className="sticky bottom-4 z-10 pt-2 sm:static">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={status.loading}
                    className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 disabled:opacity-60 sm:w-auto"
                >
                    {status.loading
                        ? t("settings.profile.saving")
                        : t("settings.profile.save")}
                </button>
            </div>
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
