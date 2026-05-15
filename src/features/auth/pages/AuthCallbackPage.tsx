import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { normalizeAuthRedirectPath } from "../utils/authRedirect.utils";

export function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, loading } = useAuth();

    const redirectTo = normalizeAuthRedirectPath(searchParams.get("redirect"));

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
                    Finishing sign in
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    We are completing your Google login and preparing your profile.
                </p>
            </section>
        );
    }

    return (
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
                Could not complete Google sign in
            </h1>
            <p className="mt-3 text-sm text-slate-500">
                Try again or continue with email and password.
            </p>
            <Link
                to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-3 font-medium text-white"
            >
                Back to login
            </Link>
        </section>
    );
}
