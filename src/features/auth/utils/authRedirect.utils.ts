import { isNativePlatform, nativeAppScheme } from "../../../shared/mobile/capacitor";

const defaultRedirectPath = "/events";
const passwordResetPath = "/reset-password";
const authCallbackPath = "/auth/callback";

export function normalizeAuthRedirectPath(redirectTo?: string | null) {
    if (!redirectTo || !redirectTo.startsWith("/")) {
        return defaultRedirectPath;
    }

    if (redirectTo.startsWith("//")) {
        return defaultRedirectPath;
    }

    return redirectTo;
}

function buildNativeUrl(path: string, searchParams?: URLSearchParams) {
    const normalizedPath = path.replace(/^\/+/, "");
    const search = searchParams?.toString();

    return `${nativeAppScheme}://${normalizedPath}${search ? `?${search}` : ""}`;
}

export function buildOAuthRedirectUrl(redirectTo?: string | null) {
    const redirectPath = normalizeAuthRedirectPath(redirectTo);
    const searchParams = new URLSearchParams({
        redirect: redirectPath,
    });

    if (isNativePlatform()) {
        return buildNativeUrl(authCallbackPath, searchParams);
    }

    return `${window.location.origin}${authCallbackPath}?${searchParams.toString()}`;
}

export function buildEmailConfirmationRedirectUrl(redirectTo?: string | null) {
    return buildOAuthRedirectUrl(redirectTo);
}

export function buildPasswordResetUrl() {
    if (isNativePlatform()) {
        return buildNativeUrl(passwordResetPath);
    }

    return `${window.location.origin}${passwordResetPath}`;
}
