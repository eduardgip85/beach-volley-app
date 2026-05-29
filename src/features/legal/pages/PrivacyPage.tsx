import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection } from "../components/LegalPageLayout";

export function PrivacyPage() {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith("es");

  const copy = isSpanish
    ? {
        title: "Política de privacidad",
        description:
          "Así explica Sandset cómo recoge, usa y protege los datos personales dentro de la app.",
        updated: "Última actualización: 21 de mayo de 2026",
        controllerTitle: "Responsable del tratamiento",
        controllerBody:
          "Sandset actúa como responsable del tratamiento de los datos personales recogidos a través de la web y de la app, incluyendo registro, gestión de perfil, participación en eventos y comunicación operativa del servicio.",
        dataTitle: "Qué datos tratamos",
        dataItems: [
          "Datos de cuenta como email, nombre completo y proveedor de acceso.",
          "Datos de perfil como avatar, país, ciudad, preferencias y visibilidad pública.",
          "Datos de uso de la app relacionados con eventos creados, participación, amistades, resultados y rating competitivo.",
          "Datos técnicos básicos necesarios para seguridad, sesiones y funcionamiento del servicio.",
        ],
        purposeTitle: "Para qué usamos los datos",
        purposeItems: [
          "Crear y mantener tu cuenta.",
          "Mostrar y gestionar tu perfil y tu actividad dentro de la app.",
          "Permitir crear eventos, unirse a eventos, validar resultados y calcular estadísticas o rating cuando proceda.",
          "Proteger la seguridad del servicio, prevenir abuso y resolver incidencias.",
        ],
        legalBasisTitle: "Base jurídica",
        legalBasisBody:
          "Tratamos tus datos principalmente porque son necesarios para ejecutar el servicio que solicitas al registrarte y usar la app. Algunos tratamientos técnicos o de seguridad también pueden apoyarse en interés legítimo. Cuando usemos tecnologías que requieran consentimiento, se pedirá de forma separada.",
        sharingTitle: "Con quién se comparten",
        sharingBody:
          "No vendemos tus datos. Pueden intervenir proveedores tecnológicos necesarios para prestar el servicio, como hosting, autenticación, base de datos, analítica o mapas, siempre dentro de la operativa normal de la plataforma.",
        retentionTitle: "Cuánto tiempo los conservamos",
        retentionBody:
          "Conservamos los datos mientras la cuenta siga activa o mientras sean necesarios para prestar el servicio, resolver incidencias, cumplir obligaciones legales o defender posibles reclamaciones. Si solicitas la eliminación de la cuenta, se eliminarán o anonimizarán los datos que corresponda según la arquitectura del servicio y las obligaciones aplicables.",
        rightsTitle: "Tus derechos",
        rightsBody:
          "Puedes solicitar acceso, rectificación, supresión, limitación, oposición o portabilidad de tus datos cuando proceda. También puedes eliminar tu cuenta desde la app si esa funcionalidad está disponible. Si consideras que el tratamiento no es correcto, puedes acudir a la autoridad de control competente.",
        publicProfileTitle: "Perfil público y visibilidad",
        publicProfileBody:
          "Algunas partes del perfil pueden mostrarse públicamente según la configuración de privacidad de la app, como nombre, país, rating o historial resumido. Tú controlas parte de esa visibilidad desde los ajustes disponibles.",
        contactTitle: "Contacto",
        contactBody:
          "Si necesitas ejercer derechos o pedir información adicional sobre privacidad, añade un canal de contacto válido antes del lanzamiento, por ejemplo un email dedicado de soporte o privacidad.",
      }
    : {
        title: "Privacy Policy",
        description:
          "This page explains how Sandset collects, uses and protects personal data across the app.",
        updated: "Last updated: May 21, 2026",
        controllerTitle: "Data controller",
        controllerBody:
          "Sandset acts as the controller for personal data collected through the website and app, including registration, profile management, event participation and operational service communications.",
        dataTitle: "What data we process",
        dataItems: [
          "Account data such as email, full name and sign-in provider.",
          "Profile data such as avatar, country, city, preferences and public visibility settings.",
          "App activity data related to created events, participation, friendships, results and competitive rating.",
          "Basic technical data required for security, sessions and service operation.",
        ],
        purposeTitle: "Why we use the data",
        purposeItems: [
          "To create and maintain your account.",
          "To display and manage your profile and in-app activity.",
          "To let users create events, join events, validate results and calculate stats or rating where applicable.",
          "To protect service security, prevent abuse and resolve incidents.",
        ],
        legalBasisTitle: "Legal basis",
        legalBasisBody:
          "We mainly process your data because it is necessary to provide the service you request when registering and using the app. Some technical or security processing may also rely on legitimate interest. Where consent is required for specific technologies, it will be requested separately.",
        sharingTitle: "Who receives the data",
        sharingBody:
          "We do not sell personal data. Technology providers necessary to operate the service may process data on our behalf, including hosting, authentication, database, analytics or maps providers, within the normal platform workflow.",
        retentionTitle: "How long we keep the data",
        retentionBody:
          "We keep data while the account remains active or while it is needed to provide the service, resolve incidents, comply with legal obligations or defend possible claims. If you request account deletion, applicable data will be deleted or anonymized according to the service architecture and legal requirements.",
        rightsTitle: "Your rights",
        rightsBody:
          "You may request access, rectification, deletion, restriction, objection or portability where applicable. You may also delete your account from inside the app if that functionality is available. If you believe the processing is not compliant, you may contact the relevant supervisory authority.",
        publicProfileTitle: "Public profile and visibility",
        publicProfileBody:
          "Some profile details may appear publicly depending on your app privacy settings, such as name, country, rating or summarized history. You control part of that visibility through the available settings.",
        contactTitle: "Contact",
        contactBody:
          "Before launch, add a valid support or privacy contact channel so users can exercise their rights or ask privacy questions.",
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

      <LegalSection title={copy.rightsTitle}>
        <p>{copy.rightsBody}</p>
      </LegalSection>

      <LegalSection title={copy.publicProfileTitle}>
        <p>{copy.publicProfileBody}</p>
      </LegalSection>

      <LegalSection title={copy.contactTitle}>
        <p>{copy.contactBody}</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
