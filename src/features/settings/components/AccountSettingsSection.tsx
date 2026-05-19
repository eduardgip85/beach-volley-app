import { LogOut, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SettingsSectionStatus } from "../types/settings.types";
import { ConfirmModal } from "./ConfirmModal";

interface AccountSettingsSectionProps {
    status: SettingsSectionStatus;
    onChangePassword: (newPassword: string, confirmPassword: string) => Promise<boolean>;
    onLogoutAllSessions: () => Promise<boolean>;
    onDeleteAccount: (confirmationText: string) => Promise<boolean>;
}

export function AccountSettingsSection({
    status,
    onChangePassword,
    onLogoutAllSessions,
    onDeleteAccount,
}: AccountSettingsSectionProps) {
    const { t } = useTranslation();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    async function handleChangePassword() {
        const updated = await onChangePassword(newPassword, confirmPassword);

        if (updated) {
            setNewPassword("");
            setConfirmPassword("");
        }
    }

    return (
        <>
            <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-bold text-slate-900">
                        {t("settings.account.changePassword")}
                    </h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                            placeholder={t("settings.account.newPassword")}
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                            placeholder={t("settings.account.confirmPassword")}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={status.loading}
                        className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                        {status.loading
                            ? t("settings.account.working")
                            : t("settings.account.updatePassword")}
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left"
                    >
                        <span className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                            <LogOut size={20} />
                        </span>
                        <span>
                            <span className="block font-bold text-slate-900">
                                {t("settings.account.logoutAll")}
                            </span>
                            <span className="mt-1 block text-sm text-slate-500">
                                {t("settings.account.logoutAllBody")}
                            </span>
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-left"
                    >
                        <span className="rounded-2xl bg-red-100 p-3 text-red-600">
                            <Trash2 size={20} />
                        </span>
                        <span>
                            <span className="block font-bold text-red-700">
                                {t("settings.account.deleteAccount")}
                            </span>
                            <span className="mt-1 block text-sm text-red-600/80">
                                {t("settings.account.deleteAccountBody")}
                            </span>
                        </span>
                    </button>
                </div>

                {status.error ? (
                    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {status.error}
                    </p>
                ) : null}

                {status.success ? (
                    <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {status.success}
                    </p>
                ) : null}
            </div>

            {showLogoutModal ? (
                <ConfirmModal
                    title={t("settings.account.logoutModalTitle")}
                    description={t("settings.account.logoutModalBody")}
                    confirmLabel={t("settings.account.logoutAll")}
                    loading={status.loading}
                    onCancel={() => setShowLogoutModal(false)}
                    onConfirm={async () => {
                        const ok = await onLogoutAllSessions();

                        if (ok) {
                            setShowLogoutModal(false);
                        }
                    }}
                />
            ) : null}

            {showDeleteModal ? (
                <ConfirmModal
                    title={t("settings.account.deleteModalTitle")}
                    description={t("settings.account.deleteModalBody")}
                    confirmLabel={t("settings.account.deleteAccount")}
                    confirmDisabled={deleteConfirmation.trim().toUpperCase() !== "DELETE"}
                    loading={status.loading}
                    onCancel={() => {
                        setDeleteConfirmation("");
                        setShowDeleteModal(false);
                    }}
                    onConfirm={async () => {
                        const ok = await onDeleteAccount(deleteConfirmation);

                        if (ok) {
                            setDeleteConfirmation("");
                            setShowDeleteModal(false);
                        }
                    }}
                >
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            <div className="flex items-center gap-2 font-semibold">
                                <ShieldAlert size={16} />
                                {t("settings.account.cannotUndo")}
                            </div>
                            <p className="mt-2">
                                {t("settings.account.deleteConsequences")}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2 font-semibold text-slate-800">
                                <ShieldCheck size={16} />
                                {t("settings.account.saferConfirmation")}
                            </div>
                            <p className="mt-2">
                                {t("settings.account.deletePrompt", {
                                    keyword: "DELETE",
                                })}
                            </p>
                        </div>

                        <input
                            value={deleteConfirmation}
                            onChange={(event) =>
                                setDeleteConfirmation(event.target.value)
                            }
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                            placeholder={t("settings.account.deletePlaceholder")}
                        />
                    </div>
                </ConfirmModal>
            ) : null}
        </>
    );
}
