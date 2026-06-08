import { PushNotifications } from "@capacitor/push-notifications";
import type { PluginListenerHandle } from "@capacitor/core";
import { useEffect } from "react";
import { router } from "../../../app/router";
import { supabase } from "../../../config/supabase";
import { isNativePlatform } from "../../../shared/mobile/capacitor";
import { useAuth } from "../../auth/context/AuthContext";
import { markNotificationRead } from "../services/notifications.service";
import {
  PUSH_DEVICE_UPDATED_EVENT,
  registerForPushNotifications,
  removePushDeviceToken,
  savePushDeviceToken,
  unregisterFromPushNotifications,
} from "../services/pushDevices.service";

function getPushData(data: unknown) {
  if (!data || typeof data !== "object") return {};
  return data as Record<string, unknown>;
}

export function PushNotificationsBoot() {
  const { loading, profile } = useAuth();

  useEffect(() => {
    if (!isNativePlatform()) return;

    let activeToken: string | null = null;
    let disposed = false;
    const listeners: PluginListenerHandle[] = [];

    async function configurePush() {
      if (loading) return;

      if (!profile?.id) {
        if (activeToken) {
          await removePushDeviceToken(activeToken).catch(() => undefined);
          activeToken = null;
        }
        await unregisterFromPushNotifications().catch(() => undefined);
        return;
      }

      const { data } = await supabase
        .from("notification_preferences")
        .select("push_enabled")
        .eq("user_id", profile.id)
        .maybeSingle();
      if (data?.push_enabled) {
        await registerForPushNotifications();
      }
    }

    void PushNotifications.addListener("registration", ({ value }) => {
      activeToken = value;
      void savePushDeviceToken(value);
    }).then((listener) => {
      if (disposed) void listener.remove();
      else listeners.push(listener);
    });

    void PushNotifications.addListener("registrationError", ({ error }) => {
      console.error("Push registration failed", error);
    }).then((listener) => {
      if (disposed) void listener.remove();
      else listeners.push(listener);
    });

    void PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
      const data = getPushData(notification.data);
      const notificationId =
        typeof data.notificationId === "string" ? data.notificationId : null;
      const deepLink = typeof data.deepLink === "string" ? data.deepLink : null;

      if (notificationId) void markNotificationRead(notificationId);
      if (deepLink?.startsWith("/")) void router.navigate(deepLink);
    }).then((listener) => {
      if (disposed) void listener.remove();
      else listeners.push(listener);
    });

    void configurePush();
    window.addEventListener(PUSH_DEVICE_UPDATED_EVENT, configurePush);

    return () => {
      disposed = true;
      window.removeEventListener(PUSH_DEVICE_UPDATED_EVENT, configurePush);
      listeners.forEach((listener) => void listener.remove());
    };
  }, [loading, profile?.id]);

  return null;
}
