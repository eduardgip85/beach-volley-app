import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { useAuth } from "../context/AuthContext";
import { normalizeAuthRedirectPath } from "../utils/authRedirect.utils";

export function AuthCallbackPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, loading } = useAuth();

    const redirectTo = normalizeAuthRedirectPath(searchParams.get("redirect"));

    usePageSeo({
        title: buildSeoTitle(t("auth.googleCallbackTitle")),
        description: loading
            ? t("auth.googleCallbackLoadingBody")
            : t("auth.googleCallbackErrorBody"),
        canonicalPath: "/auth/callback",
        noindex: true,
    });

    useEffect(() => {
        if (loading) {
            return;
        }

        if (isAuthenticated) {
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, loading, navigate, redirectTo]);

    if (loading) {
        return (
            <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">
                    {t("auth.googleCallbackLoadingTitle")}
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    {t("auth.googleCallbackLoadingBody")}
                </p>
            </section>
        );
    }

    return (
            <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
                {t("auth.googleCallbackErrorTitle")}
            </h1>
            <p className="mt-3 text-sm text-slate-500">
                {t("auth.googleCallbackErrorBody")}
            </p>
            <Link
                to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-3 font-medium text-white"
            >
                {t("auth.backToLogin")}
            </Link>
        </section>
    );
}
