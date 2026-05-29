export const COOKIE_CONSENT_STORAGE_KEY = "sandset-cookie-consent";

export type CookieConsentChoice = "accepted" | "rejected";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredCookieConsent(): CookieConsentChoice | null {
  if (!isBrowser()) {
    return null;
  }

  const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

  return value === "accepted" || value === "rejected" ? value : null;
}

export function persistCookieConsent(choice: CookieConsentChoice) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
}

export function isAnalyticsConsentGranted() {
  return getStoredCookieConsent() === "accepted";
}

export function applyGoogleConsentMode(choice: CookieConsentChoice | null) {
  if (!isBrowser() || typeof window.gtag !== "function") {
    return;
  }

  if (!choice) {
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });
    return;
  }

  window.gtag("consent", "update", {
    analytics_storage: choice === "accepted" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}
