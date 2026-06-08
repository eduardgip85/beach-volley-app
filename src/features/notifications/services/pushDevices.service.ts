import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "../../../config/supabase";
import { getNativePlatform, isNativePlatform } from "../../../shared/mobile/capacitor";

export const PUSH_DEVICE_UPDATED_EVENT = "push-device:updated";
export const PUSH_CHANNEL_ID = "sandset_activity";

export async function savePushDeviceToken(token: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return;

  const { error } = await supabase.from("push_devices").upsert(
    {
      token,
      user_id: user.id,
      platform: getNativePlatform(),
      enabled: true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "token" }
  );

  if (error) throw error;
}

export async function removePushDeviceToken(token: string) {
  const { error } = await supabase.from("push_devices").delete().eq("token", token);
  if (error) throw error;
}

export async function registerForPushNotifications() {
  if (!isNativePlatform()) return false;

  let permission = await PushNotifications.checkPermissions();

  if (permission.receive === "prompt" || permission.receive === "prompt-with-rationale") {
    permission = await PushNotifications.requestPermissions();
  }

  if (permission.receive !== "granted") {
    return false;
  }

  await PushNotifications.createChannel({
    id: PUSH_CHANNEL_ID,
    name: "Sandset activity",
    description: "Matches, invitations, results and tournament updates",
    importance: 4,
    vibration: true,
    lights: true,
    lightColor: "#2563EB",
  });
  await PushNotifications.register();
  return true;
}

export async function unregisterFromPushNotifications() {
  if (!isNativePlatform()) return;
  await PushNotifications.unregister();
}

export function notifyPushDeviceUpdated() {
  window.dispatchEvent(new Event(PUSH_DEVICE_UPDATED_EVENT));
}
