import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection } from "../components/LegalPageLayout";

export function TermsPage() {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith("es");

  const copy = isSpanish
    ? {
        title: "Términos de uso",
        description:
          "Condiciones básicas para utilizar SandSet y participar en la comunidad dentro de la app.",
        updated: "Última actualización: 21 de mayo de 2026",
        accessTitle: "Acceso al servicio",
        accessBody:
          "SandSet ofrece una plataforma para descubrir, crear y gestionar eventos de vóley playa, perfiles de jugador y resultados asociados. El acceso al servicio puede cambiar o actualizarse con el tiempo.",
        accountTitle: "Cuenta de usuario",
        accountBody:
          "Eres responsable de la información que subes, del uso de tu cuenta y de mantener la seguridad de tus credenciales. No debes suplantar a otras personas ni usar la app de forma fraudulenta.",
        conductTitle: "Uso permitido",
        conductItems: [
          "Usar la app de forma respetuosa con otros jugadores y organizadores.",
          "No publicar contenido ilegal, engañoso, ofensivo o que vulnere derechos de terceros.",
          "No manipular resultados, rankings o flujos competitivos de forma abusiva.",
          "No intentar acceder sin autorización a datos, cuentas o áreas restringidas.",
        ],
        eventsTitle: "Eventos y resultados",
        eventsBody:
          "Los organizadores y participantes son responsables de la información práctica de sus eventos. SandSet facilita herramientas de coordinación, pero no garantiza que un evento llegue a celebrarse ni asume responsabilidad directa sobre la conducta offline de los participantes.",
        moderationTitle: "Suspensión o retirada",
        moderationBody:
          "La plataforma puede limitar funciones, retirar contenido o suspender cuentas si detecta uso abusivo, fraude, manipulación del sistema o incumplimiento grave de estas condiciones.",
        liabilityTitle: "Responsabilidad",
        liabilityBody:
          "El servicio se ofrece tal como está, dentro de lo razonablemente posible. SandSet intentará mantener la plataforma disponible y segura, pero no garantiza ausencia total de errores, interrupciones o disponibilidad continua.",
        updatesTitle: "Cambios",
        updatesBody:
          "Estas condiciones pueden actualizarse para reflejar cambios del producto, requisitos legales o mejoras operativas. La versión publicada en la app será la vigente.",
      }
    : {
        title: "Terms of Use",
        description:
          "Basic conditions for using SandSet and taking part in the community inside the app.",
        updated: "Last updated: May 21, 2026",
        accessTitle: "Access to the service",
        accessBody:
          "SandSet provides a platform to discover, create and manage beach volleyball events, player profiles and related results. Access to the service may evolve over time.",
        accountTitle: "User account",
        accountBody:
          "You are responsible for the information you upload, for the use of your account and for keeping your credentials secure. You must not impersonate other people or use the app fraudulently.",
        conductTitle: "Permitted use",
        conductItems: [
          "Use the app respectfully toward other players and organizers.",
          "Do not publish illegal, misleading, offensive content or content that infringes third-party rights.",
          "Do not manipulate results, rankings or competitive flows in an abusive way.",
          "Do not attempt to access data, accounts or restricted areas without authorization.",
        ],
        eventsTitle: "Events and results",
        eventsBody:
          "Organizers and participants are responsible for the practical information of their events. SandSet provides coordination tools, but does not guarantee that an event will take place and does not assume direct responsibility for participants' offline conduct.",
        moderationTitle: "Suspension or removal",
        moderationBody:
          "The platform may limit features, remove content or suspend accounts if it detects abuse, fraud, system manipulation or serious breach of these terms.",
        liabilityTitle: "Liability",
        liabilityBody:
          "The service is provided as available within reasonable limits. SandSet will try to keep the platform secure and accessible, but does not guarantee that errors, interruptions or downtime will never occur.",
        updatesTitle: "Changes",
        updatesBody:
          "These terms may be updated to reflect product changes, legal requirements or operational improvements. The version published in the app will be the current one.",
      };

  return (
    <LegalPageLayout title={copy.title} description={copy.description}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {copy.updated}
      </p>

      <LegalSection title={copy.accessTitle}>
        <p>{copy.accessBody}</p>
      </LegalSection>

      <LegalSection title={copy.accountTitle}>
        <p>{copy.accountBody}</p>
      </LegalSection>

      <LegalSection title={copy.conductTitle}>
        <ul className="list-disc space-y-2 pl-5">
          {copy.conductItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={copy.eventsTitle}>
        <p>{copy.eventsBody}</p>
      </LegalSection>

      <LegalSection title={copy.moderationTitle}>
        <p>{copy.moderationBody}</p>
      </LegalSection>

      <LegalSection title={copy.liabilityTitle}>
        <p>{copy.liabilityBody}</p>
      </LegalSection>

      <LegalSection title={copy.updatesTitle}>
        <p>{copy.updatesBody}</p>
      </LegalSection>
    </LegalPageLayout>
  );
}

