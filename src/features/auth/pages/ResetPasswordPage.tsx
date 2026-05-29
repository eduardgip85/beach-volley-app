import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { useAuth } from "../context/AuthContext";
import { updateRecoveredPassword } from "../services/auth.service";

export function ResetPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { loading, isAuthenticated } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    usePageSeo({
        title: buildSeoTitle(t("auth.resetPasswordTitle")),
        description: t("auth.resetPasswordBody"),
        canonicalPath: "/reset-password",
        noindex: true,
    });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (password.length < 8) {
            setError(t("auth.resetPasswordTooShort"));
            return;
        }

        if (password !== confirmPassword) {
            setError(t("auth.resetPasswordMismatch"));
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            await updateRecoveredPassword(password);
            navigate("/login?reset=success", { replace: true });
        } catch (updateError) {
            console.error(updateError);
            setError(t("auth.resetPasswordUpdateError"));
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">
                    {t("auth.resetPasswordTitle")}
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    {t("common.loading")}
                </p>
            </section>
        );
    }

    if (!isAuthenticated) {
        return (
            <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">
                    {t("auth.resetPasswordTitle")}
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    {t("auth.resetPasswordInvalidLink")}
                </p>
                <Link
                    to="/forgot-password"
                    className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-3 font-medium text-white"
                >
                    {t("auth.requestAnotherReset")}
                </Link>
            </section>
        );
    }

    return (
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
                {t("auth.resetPasswordTitle")}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
                {t("auth.resetPasswordBody")}
            </p>

            {error ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                    type="password"
                    placeholder={t("auth.newPasswordPlaceholder")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                    minLength={8}
                    required
                />

                <input
                    type="password"
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                    minLength={8}
                    required
                />

                <button
                    disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-60"
                >
                    {submitting
                        ? t("auth.resetPasswordSaving")
                        : t("auth.resetPasswordCta")}
                </button>
            </form>
        </section>
    );
}
