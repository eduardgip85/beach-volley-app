import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection } from "../components/LegalPageLayout";

export function CookiesPage() {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith("es");

  const copy = isSpanish
    ? {
        title: "Política de cookies",
        description:
          "Información sobre cookies y tecnologías similares utilizadas por SandSet.",
        updated: "Última actualización: 21 de mayo de 2026",
        whatTitle: "Qué son las cookies",
        whatBody:
          "Las cookies y tecnologías similares son pequeños archivos o identificadores que permiten recordar sesiones, preferencias o medir el uso del sitio.",
        typesTitle: "Qué tipos pueden usarse",
        typeItems: [
          "Cookies técnicas o estrictamente necesarias para inicio de sesión, seguridad y funcionamiento básico.",
          "Cookies de preferencias para recordar idioma u opciones del usuario.",
          "Cookies analíticas o medición, si activas herramientas de analítica.",
        ],
        consentTitle: "Consentimiento",
        consentBody:
          "Las cookies técnicas necesarias pueden utilizarse para que la app funcione correctamente. Si SandSet usa cookies analíticas o similares no necesarias, deben cargarse solo tras el consentimiento válido del usuario.",
        managementTitle: "Cómo gestionarlas",
        managementBody:
          "Puedes aceptar o rechazar determinadas cookies desde el banner o panel de preferencias que implemente la app, y también configurar el navegador para bloquearlas o eliminarlas.",
        thirdPartyTitle: "Terceros",
        thirdPartyBody:
          "Algunos servicios de terceros, como analítica, mapas o contenido externo, pueden usar sus propias cookies o identificadores si se integran en la app.",
        reviewTitle: "Revisión antes del lanzamiento",
        reviewBody:
          "Antes de publicar, conviene revisar exactamente qué herramientas están instaladas para documentar con precisión qué cookies existen y si requieren consentimiento.",
      }
    : {
        title: "Cookie Policy",
        description:
          "Information about cookies and similar technologies used by SandSet.",
        updated: "Last updated: May 21, 2026",
        whatTitle: "What cookies are",
        whatBody:
          "Cookies and similar technologies are small files or identifiers that help remember sessions, preferences or website usage information.",
        typesTitle: "What types may be used",
        typeItems: [
          "Technical or strictly necessary cookies for sign-in, security and core functionality.",
          "Preference cookies to remember language or user choices.",
          "Analytics or measurement cookies if analytics tools are enabled.",
        ],
        consentTitle: "Consent",
        consentBody:
          "Necessary technical cookies may be used so the app can function properly. If SandSet uses analytics or other non-essential cookies, they should only load after valid user consent.",
        managementTitle: "How to manage them",
        managementBody:
          "You may accept or reject certain cookies through the banner or preferences panel implemented by the app, and you can also configure your browser to block or remove them.",
        thirdPartyTitle: "Third parties",
        thirdPartyBody:
          "Some third-party services, such as analytics, maps or embedded content, may use their own cookies or identifiers if integrated into the app.",
        reviewTitle: "Pre-launch review",
        reviewBody:
          "Before launch, it is a good idea to audit the exact tools installed in order to document precisely which cookies exist and whether they require consent.",
      };

  return (
    <LegalPageLayout title={copy.title} description={copy.description}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {copy.updated}
      </p>

      <LegalSection title={copy.whatTitle}>
        <p>{copy.whatBody}</p>
      </LegalSection>

      <LegalSection title={copy.typesTitle}>
        <ul className="list-disc space-y-2 pl-5">
          {copy.typeItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={copy.consentTitle}>
        <p>{copy.consentBody}</p>
      </LegalSection>

      <LegalSection title={copy.managementTitle}>
        <p>{copy.managementBody}</p>
      </LegalSection>

      <LegalSection title={copy.thirdPartyTitle}>
        <p>{copy.thirdPartyBody}</p>
      </LegalSection>

      <LegalSection title={copy.reviewTitle}>
        <p>{copy.reviewBody}</p>
      </LegalSection>
    </LegalPageLayout>
  );
}

