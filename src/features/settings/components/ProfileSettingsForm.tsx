import { ImagePlus, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import type { SettingsSectionStatus } from "../types/settings.types";
import { readAvatarFileAsDataUrl } from "../utils/avatar.utils";

interface ProfileSettingsFormProps {
    fullName: string;
    username: string;
    avatarUrl: string;
    status: SettingsSectionStatus;
    onFullNameChange: (value: string) => void;
    onUsernameChange: (value: string) => void;
    onAvatarUrlChange: (value: string) => void;
    onSave: () => void;
}

export function ProfileSettingsForm({
    fullName,
    username,
    avatarUrl,
    status,
    onFullNameChange,
    onUsernameChange,
    onAvatarUrlChange,
    onSave,
}: ProfileSettingsFormProps) {
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
                error instanceof Error ? error.message : "Could not load avatar"
            );
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                        Full name
                    </span>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <UserRound size={18} className="text-slate-400" />
                        <input
                            value={fullName}
                            onChange={(event) => onFullNameChange(event.target.value)}
                            className="w-full bg-transparent text-sm text-slate-900 outline-none"
                            placeholder="Beach Volley Player"
                        />
                    </div>
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                        Username
                    </span>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="text-sm font-bold text-slate-400">@</span>
                        <input
                            value={username}
                            onChange={(event) => onUsernameChange(event.target.value)}
                            className="w-full bg-transparent text-sm text-slate-900 outline-none"
                            placeholder="ed1"
                        />
                    </div>
                </label>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-700">
                        Avatar image
                    </span>

                    {avatarUrl.trim() ? (
                        <button
                            type="button"
                            onClick={() => onAvatarUrlChange("")}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"
                        >
                            <Trash2 size={14} />
                            Remove
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
                        Upload avatar
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        JPG, PNG or WebP up to 2MB
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
                        Your uploaded image will be used across your profile and player cards.
                    </div>
                ) : (
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                        If you do not upload an image, we will keep using your initial.
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
                    {status.loading ? "Saving..." : "Save profile"}
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
