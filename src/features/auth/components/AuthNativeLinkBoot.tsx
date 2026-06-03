import { App as CapacitorApp } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";
import { useEffect } from "react";
import { router } from "../../../app/router";
import { closeNativeBrowser } from "../../../shared/mobile/browser";
import { isNativePlatform, nativeAppScheme } from "../../../shared/mobile/capacitor";
import {
    getAuthDeepLinkTarget,
    restoreSessionFromDeepLink,
} from "../services/authDeepLink.service";

function isSandsetDeepLink(url: string) {
    return url.startsWith(`${nativeAppScheme}://`);
}

async function handleDeepLink(url: string) {
    if (!isSandsetDeepLink(url)) {
        return;
    }

    const { internalPath, redirectTo } = getAuthDeepLinkTarget(url);

    try {
        await restoreSessionFromDeepLink(url);
        await closeNativeBrowser();
    } catch (error) {
        console.error("Could not restore auth session from deep link", error);
        await closeNativeBrowser();
    }

    if (internalPath === "/auth/callback") {
        await router.navigate(
            `/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
            {
                replace: true,
            }
        );
        return;
    }

    if (internalPath === "/reset-password") {
        await router.navigate("/reset-password", { replace: true });
        return;
    }

    await router.navigate(internalPath, { replace: true });
}

export function AuthNativeLinkBoot() {
    useEffect(() => {
        if (!isNativePlatform()) {
            return;
        }

        let appUrlOpenListener: PluginListenerHandle | null = null;
        let isDisposed = false;

        void CapacitorApp.getLaunchUrl().then((launchUrl) => {
            if (isDisposed || !launchUrl?.url) {
                return;
            }

            void handleDeepLink(launchUrl.url);
        });

        void CapacitorApp.addListener("appUrlOpen", ({ url }) => {
            void handleDeepLink(url);
        }).then((listener) => {
            if (isDisposed) {
                void listener.remove();
                return;
            }

            appUrlOpenListener = listener;
        });

        return () => {
            isDisposed = true;

            if (appUrlOpenListener) {
                void appUrlOpenListener.remove();
            }
        };
    }, []);

    return null;
}
