import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  applyGoogleConsentMode,
  getStoredCookieConsent,
  persistCookieConsent,
  type CookieConsentChoice,
} from "../analytics/cookieConsent";
import { trackGoogleAnalyticsPageView } from "../analytics/googleAnalytics";

export function CookieConsentBanner() {
  const { t } = useTranslation();
  const [consentChoice, setConsentChoice] = useState<CookieConsentChoice | null>(null);

  useEffect(() => {
    setConsentChoice(getStoredCookieConsent());
  }, []);

  function handleChoice(choice: CookieConsentChoice) {
    persistCookieConsent(choice);
    applyGoogleConsentMode(choice);
    setConsentChoice(choice);

    if (choice === "accepted") {
      trackGoogleAnalyticsPageView(
        `${window.location.pathname}${window.location.search}${window.location.hash}`
      );
    }
  }

  if (consentChoice !== null) {
    return null;
  }

  return (
    <div className="cookie-consent-safe fixed z-[2300] mx-auto max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white/95 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
            {t("cookieConsent.eyebrow")}
          </p>
          <h2 className="mt-2 text-lg font-black text-slate-950">
            {t("cookieConsent.title")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("cookieConsent.body")}{" "}
            <Link to="/cookies" className="font-bold text-blue-600 hover:text-blue-700">
              {t("cookieConsent.more")}
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:min-w-[220px]">
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            {t("cookieConsent.accept")}
          </button>
          <button
            type="button"
            onClick={() => handleChoice("rejected")}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {t("cookieConsent.reject")}
          </button>
        </div>
      </div>
    </div>
  );
}
