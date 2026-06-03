import { supabase } from "../../../config/supabase";
import { normalizeAuthRedirectPath } from "../utils/authRedirect.utils";

function getDeepLinkParams(url: URL) {
    const params = new URLSearchParams(url.search);
    const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
    const hashParams = new URLSearchParams(hash);

    hashParams.forEach((value, key) => {
        if (!params.has(key)) {
            params.set(key, value);
        }
    });

    return params;
}

export function getInternalPathFromDeepLink(url: URL) {
    const segments = [url.host, ...url.pathname.split("/").filter(Boolean)].filter(
        Boolean
    );

    return `/${segments.join("/")}`;
}

export function getAuthDeepLinkTarget(urlString: string) {
    const url = new URL(urlString);
    const internalPath = getInternalPathFromDeepLink(url);
    const params = getDeepLinkParams(url);
    const redirectTo = normalizeAuthRedirectPath(params.get("redirect"));

    return {
        internalPath,
        redirectTo,
        params,
    };
}

export async function restoreSessionFromDeepLink(urlString: string) {
    const { params } = getAuthDeepLinkTarget(urlString);
    const errorCode = params.get("error_code") ?? params.get("error");
    const errorDescription = params.get("error_description");

    if (errorCode) {
        throw new Error(errorDescription ?? errorCode);
    }

    const authCode = params.get("code");

    if (authCode) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(
            authCode
        );

        if (error) {
            throw error;
        }

        return data.session;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
        return null;
    }

    const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    if (error) {
        throw error;
    }

    return data.session;
}
