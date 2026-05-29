import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { requestPasswordReset } from "../services/auth.service";

export function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    usePageSeo({
        title: buildSeoTitle(t("auth.forgotPasswordTitle")),
        description: t("auth.forgotPasswordBody"),
        canonicalPath: "/forgot-password",
        noindex: true,
    });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await requestPasswordReset(email);
            setSuccess(t("auth.resetPasswordEmailSent"));
        } catch (requestError) {
            console.error(requestError);
            setError(t("auth.resetPasswordEmailError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
                {t("auth.forgotPasswordTitle")}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
                {t("auth.forgotPasswordBody")}
            </p>

            {error ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            ) : null}

            {success ? (
                <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                </p>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                    required
                />

                <button
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-60"
                >
                    {loading
                        ? t("auth.sendingResetLink")
                        : t("auth.sendResetLink")}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                <Link to="/login" className="font-medium text-blue-600">
                    {t("auth.backToLogin")}
                </Link>
            </p>
        </section>
    );
}
