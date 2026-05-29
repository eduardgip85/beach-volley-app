import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { loginUser, loginWithGoogle } from "../services/auth.service";
import { normalizeAuthRedirectPath } from "../utils/authRedirect.utils";

export function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const redirectTo = normalizeAuthRedirectPath(searchParams.get("redirect"));
    const resetSuccess = searchParams.get("reset") === "success";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    usePageSeo({
        title: buildSeoTitle(t("auth.loginTitle")),
        description: t("auth.loginBody"),
        canonicalPath: "/login",
        noindex: true,
    });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            await loginUser(email, password);

            navigate(redirectTo);
        } catch {
            setError(t("auth.invalidCredentials"));
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        try {
            setLoading(true);
            setError("");

            await loginWithGoogle(redirectTo);
        } catch {
            setError(t("auth.googleError"));
            setLoading(false);
        }
    }

    return (
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6">
            <Link
                to="/"
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            >
                {t("nav.home")}
            </Link>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{t("auth.loginTitle")}</h1>

        <p className="mt-2 text-sm text-slate-500">
            {t("auth.loginBody")}
        </p>

        {resetSuccess ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {t("auth.resetPasswordUpdated")}
            </p>
        ) : null}

        {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
            </p>
        )}

        <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
            {t("auth.continueWithGoogle")}
        </button>

        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            {t("auth.or")}
            <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            required
            />

            <input
            type="password"
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            required
            />

            <div className="flex justify-end">
                <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600"
                >
                    {t("auth.forgotPasswordCta")}
                </Link>
            </div>

            <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-60"
            >
            {loading ? t("auth.loginLoading") : t("auth.loginCta")}
            </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
            {t("auth.noAccount")}{" "}
            <Link
            to={`/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-blue-600"
            >
            {t("auth.registerCta")}
            </Link>
        </p>
        </section>
    );
}
