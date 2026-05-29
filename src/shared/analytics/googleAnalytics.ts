import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const GA_MEASUREMENT_ID = "G-8PP1DH9CRD";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "event" | "js",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

export function trackGoogleAnalyticsPageView(path: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  });
}

export function useGoogleAnalyticsPageTracking() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackGoogleAnalyticsPageView(path);
  }, [location.hash, location.pathname, location.search]);
}
