const defaultRedirectPath = "/events";
const passwordResetPath = "/reset-password";

export function normalizeAuthRedirectPath(redirectTo?: string | null) {
    if (!redirectTo || !redirectTo.startsWith("/")) {
        return defaultRedirectPath;
    }

    if (redirectTo.startsWith("//")) {
        return defaultRedirectPath;
    }

    return redirectTo;
}

export function buildOAuthRedirectUrl(redirectTo?: string | null) {
    const redirectPath = normalizeAuthRedirectPath(redirectTo);

    return `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
        redirectPath
    )}`;
}

export function buildPasswordResetUrl() {
    return `${window.location.origin}${passwordResetPath}`;
}
