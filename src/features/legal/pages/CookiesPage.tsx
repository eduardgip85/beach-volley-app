import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  applyGoogleConsentMode,
  getStoredCookieConsent,
  persistCookieConsent,
  type CookieConsentChoice,
} from "../../../shared/analytics/cookieConsent";
import { trackGoogleAnalyticsPageView } from "../../../shared/analytics/googleAnalytics";
import { LegalPageLayout, LegalSection } from "../components/LegalPageLayout";

export function CookiesPage() {
  const { i18n } = useTranslation();
  const isSpanish =
    i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");
  const [choice, setChoice] = useState<CookieConsentChoice | null>(() =>
    getStoredCookieConsent()
  );

  const copy = isSpanish
    ? {
        title: "Politica de cookies",
        description:
          "Informacion sobre cookies, localStorage y tecnologias similares utilizadas por Sandset.",
        updated: "Ultima actualizacion: 5 de junio de 2026",
        whatTitle: "Que son",
        whatBody:
          "Las cookies y tecnologias similares permiten recordar sesiones, preferencias o senales de uso. En Sandset tambien usamos localStorage para guardar elecciones como idioma, consentimiento de analitica o avisos ya vistos.",
        usedTitle: "Que puede usar Sandset",
        usedItems: [
          "Tecnologias necesarias para login, seguridad, sesion y funcionamiento basico.",
          "Preferencias locales, como idioma, consentimiento de cookies, filtros o ultima visita a ciertas secciones.",
          "Analitica de uso si el usuario la acepta desde el banner o esta pagina.",
          "Servicios externos como mapas, hosting o analitica, que pueden usar sus propias tecnologias si estan integrados.",
        ],
        analyticsTitle: "Analitica",
        analyticsBody:
          "La analitica ayuda a entender uso agregado y mejorar el producto. Si rechazas analitica, Sandset mantendra la app funcionando y no deberia activar medicion no esencial.",
        pushTitle: "Notificaciones push",
        pushBody:
          "Las notificaciones push de una futura app movil no son cookies. Requeriran permiso separado del dispositivo y una politica clara sobre que eventos generan avisos.",
        manageTitle: "Gestionar preferencia",
        manageBody:
          "Puedes cambiar tu eleccion de analitica aqui. Las cookies tecnicas necesarias no se pueden desactivar desde este panel porque hacen funcionar la app.",
        accept: "Aceptar analitica",
        reject: "Rechazar analitica",
        currentAccepted: "Estado actual: analitica aceptada.",
        currentRejected: "Estado actual: analitica rechazada.",
        currentUnset: "Estado actual: sin eleccion guardada.",
        browserTitle: "Gestion desde el navegador",
        browserBody:
          "Tambien puedes bloquear o eliminar cookies y almacenamiento local desde la configuracion del navegador. Si lo haces, algunas preferencias o sesiones pueden perderse.",
        reviewTitle: "Revision antes de lanzamiento",
        reviewBody:
          "Antes de publicar, conviene auditar las herramientas instaladas para listar proveedores reales, finalidades y duraciones exactas.",
      }
    : {
        title: "Cookie Policy",
        description:
          "Information about cookies, localStorage and similar technologies used by Sandset.",
        updated: "Last updated: June 5, 2026",
        whatTitle: "What they are",
        whatBody:
          "Cookies and similar technologies help remember sessions, preferences or usage signals. Sandset also uses localStorage to save choices such as language, analytics consent or already-seen notices.",
        usedTitle: "What Sandset may use",
        usedItems: [
          "Necessary technologies for login, security, sessions and core functionality.",
          "Local preferences, such as language, cookie consent, filters or last visit to certain sections.",
          "Usage analytics if the user accepts it from the banner or this page.",
          "External services such as maps, hosting or analytics, which may use their own technologies if integrated.",
        ],
        analyticsTitle: "Analytics",
        analyticsBody:
          "Analytics helps understand aggregated usage and improve the product. If you reject analytics, Sandset will keep the app working and should not enable non-essential measurement.",
        pushTitle: "Push notifications",
        pushBody:
          "Push notifications in a future mobile app are not cookies. They will require separate device permission and a clear policy on which events generate alerts.",
        manageTitle: "Manage preference",
        manageBody:
          "You can change your analytics choice here. Necessary technical cookies cannot be disabled from this panel because they keep the app working.",
        accept: "Accept analytics",
        reject: "Reject analytics",
        currentAccepted: "Current status: analytics accepted.",
        currentRejected: "Current status: analytics rejected.",
        currentUnset: "Current status: no saved choice.",
        browserTitle: "Browser controls",
        browserBody:
          "You can also block or delete cookies and local storage from your browser settings. If you do, some preferences or sessions may be lost.",
        reviewTitle: "Pre-launch review",
        reviewBody:
          "Before publishing, audit the installed tools to list real providers, purposes and exact retention periods.",
      };

  function handleChoice(nextChoice: CookieConsentChoice) {
    persistCookieConsent(nextChoice);
    applyGoogleConsentMode(nextChoice);
    setChoice(nextChoice);

    if (nextChoice === "accepted") {
      trackGoogleAnalyticsPageView(
        `${window.location.pathname}${window.location.search}${window.location.hash}`
      );
    }
  }

  const currentChoiceLabel =
    choice === "accepted"
      ? copy.currentAccepted
      : choice === "rejected"
        ? copy.currentRejected
        : copy.currentUnset;

  return (
    <LegalPageLayout
      title={copy.title}
      description={copy.description}
      canonicalPath="/cookies"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {copy.updated}
      </p>

      <LegalSection title={copy.whatTitle}>
        <p>{copy.whatBody}</p>
      </LegalSection>

      <LegalSection title={copy.usedTitle}>
        <ul className="list-disc space-y-2 pl-5">
          {copy.usedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={copy.analyticsTitle}>
        <p>{copy.analyticsBody}</p>
      </LegalSection>

      <LegalSection title={copy.pushTitle}>
        <p>{copy.pushBody}</p>
      </LegalSection>

      <LegalSection title={copy.manageTitle}>
        <p>{copy.manageBody}</p>
        <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-sm font-bold text-slate-900">{currentChoiceLabel}</p>
          <div className="mt-4 grid gap-3 sm:flex">
            <button
              type="button"
              onClick={() => handleChoice("accepted")}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              {copy.accept}
            </button>
            <button
              type="button"
              onClick={() => handleChoice("rejected")}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {copy.reject}
            </button>
          </div>
        </div>
      </LegalSection>

      <LegalSection title={copy.browserTitle}>
        <p>{copy.browserBody}</p>
      </LegalSection>

      <LegalSection title={copy.reviewTitle}>
        <p>{copy.reviewBody}</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
