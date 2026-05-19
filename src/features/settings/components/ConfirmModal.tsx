import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ConfirmModalProps {
    title: string;
    description: string;
    children?: ReactNode;
    confirmLabel: string;
    cancelLabel?: string;
    confirmDisabled?: boolean;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function ConfirmModal({
    title,
    description,
    children,
    confirmLabel,
    cancelLabel,
    confirmDisabled = false,
    loading = false,
    onCancel,
    onConfirm,
}: ConfirmModalProps) {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-[2400] flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-[2px] sm:items-center">
            <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
                <h3 className="text-2xl font-black text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>

                {children ? <div className="mt-5">{children}</div> : null}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                    >
                        {cancelLabel ?? t("common.cancel")}
                    </button>

                    <button
                        type="button"
                        disabled={confirmDisabled || loading}
                        onClick={onConfirm}
                        className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                    >
                        {loading ? t("settings.account.working") : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
