import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection } from "../components/LegalPageLayout";

export function TermsPage() {
  const { i18n } = useTranslation();
  const isSpanish =
    i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");

  const copy = isSpanish
    ? {
        title: "Terminos de uso",
        description:
          "Condiciones basicas para utilizar Sandset y participar en la comunidad.",
        updated: "Ultima actualizacion: 5 de junio de 2026",
        serviceTitle: "Servicio",
        serviceBody:
          "Sandset permite descubrir, crear y gestionar eventos de voley playa, open plays, partidos, torneos, perfiles, amistades, resultados, ranking e ideas de producto. El producto puede cambiar con el tiempo.",
        accountTitle: "Cuenta",
        accountBody:
          "Eres responsable de la informacion que aportas, del uso de tu cuenta y de mantener tus credenciales seguras. No debes suplantar a otras personas ni usar la app de forma fraudulenta.",
        onboardingTitle: "Onboarding y ranking",
        onboardingBody:
          "Algunas funciones requieren completar datos minimos de perfil. Para crear partidos competitivos o participar en flujos con rating puede exigirse completar el ranking inicial. El rating es una estimacion y puede ajustarse con resultados aceptados.",
        conductTitle: "Uso permitido",
        conductItems: [
          "Tratar con respeto a jugadores, organizadores y administradores.",
          "No publicar contenido ilegal, ofensivo, enganoso, spam o contenido que vulnere derechos de terceros.",
          "No manipular resultados, votos, ranking, invitaciones, solicitudes o moderacion.",
          "No intentar acceder a cuentas, datos o areas restringidas sin autorizacion.",
          "No usar mapas, eventos o perfiles para acoso, abuso o fines ajenos a la comunidad deportiva.",
        ],
        eventsTitle: "Eventos y actividad offline",
        eventsBody:
          "Los organizadores y participantes son responsables de la informacion practica, seguridad y conducta offline de sus eventos. Sandset facilita coordinacion, pero no garantiza que un evento se celebre ni supervisa fisicamente los encuentros.",
        ideasTitle: "Ideas y contenido enviado",
        ideasBody:
          "Si propones ideas, votas o envias contenido, concedes a Sandset permiso para revisarlo, moderarlo, mostrarlo dentro de la app y usarlo para priorizar o desarrollar funcionalidades sin obligacion de compensacion.",
        moderationTitle: "Moderacion",
        moderationBody:
          "Sandset puede ocultar contenido, borrar ideas, limitar funciones, cancelar eventos o suspender cuentas si detecta abuso, fraude, riesgo para usuarios o incumplimiento de estos terminos.",
        liabilityTitle: "Responsabilidad",
        liabilityBody:
          "El servicio se ofrece tal como esta y segun disponibilidad razonable. Sandset intentara mantener la plataforma segura y operativa, pero no garantiza ausencia total de errores, interrupciones o perdida de disponibilidad.",
        updatesTitle: "Cambios",
        updatesBody:
          "Estos terminos pueden actualizarse para reflejar cambios del producto, requisitos legales o mejoras operativas. La version publicada en la app sera la vigente.",
      }
    : {
        title: "Terms of Use",
        description:
          "Basic conditions for using Sandset and taking part in the community.",
        updated: "Last updated: June 5, 2026",
        serviceTitle: "Service",
        serviceBody:
          "Sandset lets users discover, create and manage beach volleyball events, open plays, matches, tournaments, profiles, friendships, results, ranking and product ideas. The product may change over time.",
        accountTitle: "Account",
        accountBody:
          "You are responsible for the information you provide, for using your account and for keeping your credentials secure. You must not impersonate others or use the app fraudulently.",
        onboardingTitle: "Onboarding and ranking",
        onboardingBody:
          "Some features require completing minimum profile data. Creating competitive matches or taking part in rating flows may require completing the starting ranking. Rating is an estimate and may adjust with accepted results.",
        conductTitle: "Permitted use",
        conductItems: [
          "Treat players, organizers and admins respectfully.",
          "Do not publish illegal, offensive, misleading, spam or third-party-infringing content.",
          "Do not manipulate results, votes, ranking, invitations, requests or moderation.",
          "Do not try to access accounts, data or restricted areas without authorization.",
          "Do not use maps, events or profiles for harassment, abuse or purposes unrelated to the sports community.",
        ],
        eventsTitle: "Events and offline activity",
        eventsBody:
          "Organizers and participants are responsible for practical information, safety and offline conduct at their events. Sandset provides coordination tools but does not guarantee that an event will happen or physically supervise meetups.",
        ideasTitle: "Ideas and submitted content",
        ideasBody:
          "If you submit ideas, votes or content, you allow Sandset to review, moderate, display it inside the app and use it to prioritize or develop features without compensation obligation.",
        moderationTitle: "Moderation",
        moderationBody:
          "Sandset may hide content, delete ideas, limit features, cancel events or suspend accounts if it detects abuse, fraud, risk to users or breach of these terms.",
        liabilityTitle: "Liability",
        liabilityBody:
          "The service is provided as available within reasonable limits. Sandset will try to keep the platform secure and operational, but does not guarantee that errors, interruptions or downtime will never occur.",
        updatesTitle: "Changes",
        updatesBody:
          "These terms may be updated to reflect product changes, legal requirements or operational improvements. The version published in the app will be current.",
      };

  return (
    <LegalPageLayout
      title={copy.title}
      description={copy.description}
      canonicalPath="/terms"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {copy.updated}
      </p>

      <LegalSection title={copy.serviceTitle}>
        <p>{copy.serviceBody}</p>
      </LegalSection>

      <LegalSection title={copy.accountTitle}>
        <p>{copy.accountBody}</p>
      </LegalSection>

      <LegalSection title={copy.onboardingTitle}>
        <p>{copy.onboardingBody}</p>
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

      <LegalSection title={copy.ideasTitle}>
        <p>{copy.ideasBody}</p>
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
