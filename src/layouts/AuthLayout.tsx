import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useGoogleAnalyticsPageTracking } from "../shared/analytics/googleAnalytics";
import { CookieConsentBanner } from "../shared/components/CookieConsentBanner";

export function AuthLayout() {
  const location = useLocation();
  useGoogleAnalyticsPageTracking();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname, location.search]);

  return (
    <>
      <main className="app-min-h-screen app-safe-top app-safe-bottom app-safe-x flex items-center justify-center bg-slate-50 px-4">
        <Outlet />
      </main>
      <CookieConsentBanner />
    </>
  );
}
