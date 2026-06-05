import { Lightbulb, MessageCircle, Vote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

type IdeasInlineCtaTone = "light" | "dark" | "sand";

interface IdeasInlineCtaProps {
  context?: "events" | "map" | "calendar" | "profile" | "general";
  tone?: IdeasInlineCtaTone;
}

export function IdeasInlineCta({
  context = "general",
  tone = "sand",
}: IdeasInlineCtaProps) {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const isSpanish =
    i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");
  const copy = getIdeasCtaCopy(isSpanish, context);
  const to = isAuthenticated
    ? "/feature-requests"
    : "/login?redirect=%2Ffeature-requests";
  const toneClass = getToneClass(tone);

  return (
    <section
      className={`relative overflow-hidden rounded-[1.75rem] p-5 shadow-sm ring-1 sm:p-6 ${toneClass.surface}`}
    >
      <div className={`absolute -right-10 -top-12 ${toneClass.ghost}`}>
        <Lightbulb size={150} />
      </div>
      <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.22em] ${toneClass.eyebrow}`}>
            {copy.eyebrow}
          </p>
          <h2 className={`mt-3 text-2xl font-black tracking-[-0.03em] ${toneClass.title}`}>
            {copy.title}
          </h2>
          <p className={`mt-2 max-w-2xl text-sm leading-7 ${toneClass.body}`}>
            {copy.body}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${toneClass.pill}`}>
              <MessageCircle size={14} />
              {copy.suggest}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${toneClass.pill}`}>
              <Vote size={14} />
              {copy.vote}
            </span>
          </div>
        </div>

        <Link
          to={to}
          className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-black transition ${toneClass.button}`}
        >
          {copy.cta}
        </Link>
      </div>
    </section>
  );
}

function getIdeasCtaCopy(
  isSpanish: boolean,
  context: NonNullable<IdeasInlineCtaProps["context"]>
) {
  if (isSpanish) {
    const contextBody = {
      events:
        "Si al organizar o unirte a eventos echas algo en falta, conviertelo en una idea votable.",
      map:
        "Filtros, pins, pistas favoritas o mejoras del mapa: recoge la idea aqui para priorizarla.",
      calendar:
        "Si el calendario podria ayudarte mejor a planificar partidos, dejanos la propuesta.",
      profile:
        "Tu perfil, ranking e historial pueden evolucionar con ideas de la comunidad.",
      general:
        "Propone mejoras para Sandset y vota lo que deberia construirse despues.",
    };

    return {
      eyebrow: "Ideas de producto",
      title: "Ayuda a decidir que construimos despues",
      body: contextBody[context],
      suggest: "Proponer",
      vote: "Votar",
      cta: "Ir a ideas",
    };
  }

  const contextBody = {
    events:
      "If something is missing while organizing or joining events, turn it into a votable idea.",
    map:
      "Filters, pins, favorite courts or map improvements: collect the idea here so it can be prioritized.",
    calendar:
      "If the calendar could help you plan matches better, leave the proposal here.",
    profile:
      "Your profile, ranking and history can evolve through community ideas.",
    general:
      "Suggest improvements for Sandset and vote on what should be built next.",
  };

  return {
    eyebrow: "Product ideas",
    title: "Help decide what we build next",
    body: contextBody[context],
    suggest: "Suggest",
    vote: "Vote",
    cta: "Open ideas",
  };
}

function getToneClass(tone: IdeasInlineCtaTone) {
  if (tone === "dark") {
    return {
      surface: "bg-slate-950 text-white ring-slate-900",
      ghost: "text-white/5",
      eyebrow: "text-amber-200",
      title: "text-white",
      body: "text-slate-300",
      pill: "bg-white/10 text-slate-200 ring-1 ring-white/10",
      button: "bg-white text-slate-950 hover:bg-slate-100",
    };
  }

  if (tone === "light") {
    return {
      surface: "bg-white text-slate-950 ring-slate-100",
      ghost: "text-blue-50",
      eyebrow: "text-blue-600",
      title: "text-slate-950",
      body: "text-slate-600",
      pill: "bg-blue-50 text-blue-700",
      button: "bg-blue-600 text-white hover:bg-blue-700",
    };
  }

  return {
    surface:
      "bg-[linear-gradient(135deg,#fff7ed_0%,#eff6ff_54%,#dcfce7_100%)] text-slate-950 ring-black/5",
    ghost: "text-amber-200/35",
    eyebrow: "text-amber-700",
    title: "text-slate-950",
    body: "text-slate-600",
    pill: "bg-white/80 text-slate-700 ring-1 ring-white/80",
    button: "bg-slate-950 text-white hover:bg-slate-800",
  };
}
