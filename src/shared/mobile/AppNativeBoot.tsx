import { App as CapacitorApp } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";
import { useEffect } from "react";
import { router } from "../../app/router";
import { getNativePlatform, isNativePlatform } from "./capacitor";

const topLevelRoutes = new Set([
  "/",
  "/events",
  "/map",
  "/calendar",
  "/ranking",
  "/friends",
  "/profile",
  "/settings",
  "/notifications",
]);

export function AppNativeBoot() {
  useEffect(() => {
    if (!isNativePlatform()) {
      return;
    }

    const platform = getNativePlatform();
    let backButtonListener: PluginListenerHandle | null = null;
    let isDisposed = false;

    document.body.classList.add("native-app");
    document.documentElement.dataset.platform = platform;

    void CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      const currentPath = window.location.pathname;

      if (canGoBack || window.history.length > 1) {
        window.history.back();
        return;
      }

      if (!topLevelRoutes.has(currentPath)) {
        void router.navigate("/");
        return;
      }

      void CapacitorApp.exitApp();
    }).then((listener) => {
      if (isDisposed) {
        void listener.remove();
        return;
      }

      backButtonListener = listener;
    });

    return () => {
      isDisposed = true;
      document.body.classList.remove("native-app");
      delete document.documentElement.dataset.platform;

      if (backButtonListener) {
        void backButtonListener.remove();
      }
    };
  }, []);

  return null;
}
