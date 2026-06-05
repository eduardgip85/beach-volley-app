import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection } from "../components/LegalPageLayout";

export function PrivacyPage() {
  const { i18n } = useTranslation();
  const isSpanish =
    i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");

  const copy = isSpanish
    ? {
        title: "Politica de privacidad",
        description:
          "Como Sandset recoge, usa y protege datos personales dentro de la web y la app.",
        updated: "Ultima actualizacion: 5 de junio de 2026",
        controllerTitle: "Responsable",
        controllerBody:
          "Sandset actua como responsable del tratamiento de los datos personales recogidos al registrarte, usar tu perfil, crear eventos, participar en partidos, votar ideas o comunicarte con la plataforma.",
        dataTitle: "Datos que tratamos",
        dataItems: [
          "Datos de cuenta: email, nombre, proveedor de acceso y datos tecnicos de sesion.",
          "Datos de perfil: avatar, pais, ciudad, preferencias de juego, disponibilidad, material, visibilidad publica y ajustes.",
          "Datos competitivos: respuestas de onboarding, rating provisional, resultados, historial, ranking y estadisticas.",
          "Datos de actividad: eventos creados, inscripciones, invitaciones, solicitudes, amistades, chat de eventos y votos o propuestas de ideas.",
          "Datos tecnicos y de seguridad: registros necesarios para autenticar, proteger el servicio, depurar errores y prevenir abuso.",
        ],
        purposeTitle: "Para que usamos los datos",
        purposeItems: [
          "Crear y mantener tu cuenta y tu perfil de jugador.",
          "Recomendar y filtrar eventos por pais, zona, mapa, calendario, preferencias y disponibilidad.",
          "Permitir crear eventos casuales, open plays, torneos y partidos competitivos cuando tengas ranking.",
          "Gestionar amistades, invitaciones, solicitudes, ideas de producto, moderacion y soporte.",
          "Calcular estadisticas, ranking, historial competitivo y senales agregadas de uso.",
          "Enviar comunicaciones operativas dentro de la app y, si se habilitan en el futuro, notificaciones push con permiso del usuario.",
        ],
        legalBasisTitle: "Base juridica",
        legalBasisBody:
          "La mayoria del tratamiento es necesario para prestar el servicio solicitado al usar Sandset. Algunos tratamientos tecnicos, de seguridad o mejora del producto pueden basarse en interes legitimo. La analitica no esencial y las notificaciones push se activaran solo cuando corresponda con consentimiento o permiso del usuario.",
        sharingTitle: "Proveedores y terceros",
        sharingBody:
          "No vendemos datos personales. Podemos usar proveedores necesarios para hosting, base de datos, autenticacion, analitica, mapas, email, almacenamiento, errores o futuras notificaciones push. Cada proveedor debe usarse solo para operar Sandset y bajo condiciones adecuadas.",
        retentionTitle: "Conservacion",
        retentionBody:
          "Conservamos los datos mientras la cuenta este activa o sean necesarios para prestar el servicio, mantener historiales, resolver incidencias, cumplir obligaciones o defender reclamaciones. Al eliminar la cuenta, los datos se eliminaran o anonimizaran segun proceda.",
        publicProfileTitle: "Perfil publico",
        publicProfileBody:
          "Algunos datos pueden mostrarse a otros usuarios, como nombre, avatar, pais, ciudad, rating, historial resumido, preferencias o material. La visibilidad puede gestionarse desde los ajustes disponibles.",
        ideasTitle: "Ideas y contenido enviado",
        ideasBody:
          "Las ideas, votos y comentarios que envies pueden usarse para priorizar el roadmap, moderar propuestas y mostrar senales agregadas a administradores o usuarios.",
        rightsTitle: "Tus derechos",
        rightsBody:
          "Puedes solicitar acceso, rectificacion, supresion, limitacion, oposicion o portabilidad cuando corresponda. Tambien puedes eliminar tu cuenta desde la app si la funcionalidad esta disponible.",
        contactTitle: "Contacto",
        contactBody:
          "Antes del lanzamiento publico debes definir un email real de soporte o privacidad para que los usuarios puedan ejercer derechos y hacer consultas.",
      }
    : {
        title: "Privacy Policy",
        description:
          "How Sandset collects, uses and protects personal data across the website and app.",
        updated: "Last updated: June 5, 2026",
        controllerTitle: "Controller",
        controllerBody:
          "Sandset acts as the controller for personal data collected when you register, use your profile, create events, join matches, vote on ideas or communicate with the platform.",
        dataTitle: "Data we process",
        dataItems: [
          "Account data: email, name, sign-in provider and session technical data.",
          "Profile data: avatar, country, city, playing preferences, availability, gear, public visibility and settings.",
          "Competitive data: onboarding answers, provisional rating, results, history, ranking and statistics.",
          "Activity data: created events, registrations, invitations, requests, friendships, event chat and product ideas or votes.",
          "Technical and security data: logs needed to authenticate, protect the service, debug errors and prevent abuse.",
        ],
        purposeTitle: "Why we use data",
        purposeItems: [
          "To create and maintain your account and player profile.",
          "To recommend and filter events by country, area, map, calendar, preferences and availability.",
          "To let users create casual events, open plays, tournaments and competitive matches when they have ranking.",
          "To manage friendships, invitations, requests, product ideas, moderation and support.",
          "To calculate statistics, ranking, competitive history and aggregated usage signals.",
          "To send operational in-app communications and, if enabled in the future, push notifications with user permission.",
        ],
        legalBasisTitle: "Legal basis",
        legalBasisBody:
          "Most processing is necessary to provide the service requested when using Sandset. Some technical, security or product improvement processing may rely on legitimate interest. Non-essential analytics and push notifications will only be enabled where appropriate with consent or user permission.",
        sharingTitle: "Providers and third parties",
        sharingBody:
          "We do not sell personal data. We may use providers needed for hosting, database, authentication, analytics, maps, email, storage, error tracking or future push notifications. Each provider should only be used to operate Sandset under appropriate terms.",
        retentionTitle: "Retention",
        retentionBody:
          "We keep data while the account is active or while needed to provide the service, maintain histories, resolve incidents, comply with obligations or defend claims. When an account is deleted, data will be deleted or anonymized where applicable.",
        publicProfileTitle: "Public profile",
        publicProfileBody:
          "Some data may be visible to other users, such as name, avatar, country, city, rating, summarized history, preferences or gear. Visibility can be managed from the available settings.",
        ideasTitle: "Ideas and submitted content",
        ideasBody:
          "Ideas, votes and comments you submit may be used to prioritize the roadmap, moderate proposals and show aggregated signals to admins or users.",
        rightsTitle: "Your rights",
        rightsBody:
          "You may request access, rectification, deletion, restriction, objection or portability where applicable. You may also delete your account from inside the app if that functionality is available.",
        contactTitle: "Contact",
        contactBody:
          "Before public launch, define a real support or privacy email so users can exercise rights and ask privacy questions.",
      };

  return (
    <LegalPageLayout
      title={copy.title}
      description={copy.description}
      canonicalPath="/privacy"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {copy.updated}
      </p>

      <LegalSection title={copy.controllerTitle}>
        <p>{copy.controllerBody}</p>
      </LegalSection>

      <LegalSection title={copy.dataTitle}>
        <ul className="list-disc space-y-2 pl-5">
          {copy.dataItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={copy.purposeTitle}>
        <ul className="list-disc space-y-2 pl-5">
          {copy.purposeItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={copy.legalBasisTitle}>
        <p>{copy.legalBasisBody}</p>
      </LegalSection>

      <LegalSection title={copy.sharingTitle}>
        <p>{copy.sharingBody}</p>
      </LegalSection>

      <LegalSection title={copy.retentionTitle}>
        <p>{copy.retentionBody}</p>
      </LegalSection>

      <LegalSection title={copy.publicProfileTitle}>
        <p>{copy.publicProfileBody}</p>
      </LegalSection>

      <LegalSection title={copy.ideasTitle}>
        <p>{copy.ideasBody}</p>
      </LegalSection>

      <LegalSection title={copy.rightsTitle}>
        <p>{copy.rightsBody}</p>
      </LegalSection>

      <LegalSection title={copy.contactTitle}>
        <p>{copy.contactBody}</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
