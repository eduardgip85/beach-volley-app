import { Capacitor } from "@capacitor/core";

export const nativeAppScheme = "app.sandset.mobile";

export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

export function getNativePlatform() {
  return Capacitor.getPlatform();
}
