import {
  CalendarDays,
  ChevronRight,
  Lightbulb,
  LockKeyhole,
  Map,
  MessageCircle,
  Plus,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AppLoadingScreen } from "../../../components/AppLoadingScreen";
import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  buildSeoTitle,
} from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { useAuth } from "../../auth/context/AuthContext";
import { UpcomingEventItem } from "../components/UpcomingEventItem";
import { useHomeData } from "../hooks/useHomeData";

const HOME_CANONICAL_URL = `${SITE_URL}/`;

interface HomeCopy {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  primaryCta: string;
  secondaryCta: string;
  visualLabel: string;
  visualTitle: string;
  visualMeta: string;
  visualChat: string;
  visualResult: string;
  visualGear: string;
  actionTitle: string;
  actionBody: string;
  actionCta: string;
  findTitle: string;
  findBody: string;
  createTitle: string;
  createBody: string;
  competeTitle: string;
  competeBody: string;
  privateTitle: string;
  privateBody: string;
  ecosystemEyebrow: string;
  ecosystemTitle: string;
  ecosystemBody: string;
  friendsTitle: string;
  friendsBody: string;
  ideasTitle: string;
  ideasBody: string;
  mapTitle: string;
  mapBody: string;
  calendarTitle: string;
  calendarBody: string;
  rankingTitle: string;
  rankingBody: string;
  profileTitle: string;
  profileBody: string;
  statEvents: string;
  statMatches: string;
  statPlayers: string;
  statOpenPlay: string;
  flowTitle: string;
  flowBody: string;
  stepOneTitle: string;
  stepOneBody: string;
  stepTwoTitle: string;
  stepTwoBody: string;
  stepThreeTitle: string;
  stepThreeBody: string;
  upcomingTitle: string;
  upcomingBody: string;
  viewAllEvents: string;
  loadingEvents: string;
  noEventsTitle: string;
  noEventsBody: string;
  finalTitle: string;
  finalBody: string;
  finalCta: string;
  profileCta: string;
  footer: string;
}

function getHomeCopy(isSpanish: boolean): HomeCopy {
  if (isSpanish) {
    return {
      seoTitle: "Sandset | Encuentra y organiza voley playa",
      seoDescription:
        "Encuentra partidos de voley playa, crea eventos, coordina jugadores y valida resultados con Sandset.",
      eyebrow: "Voley playa local, sin caos",
      heroTitle: "Encuentra partido. Llena pista. Juega.",
      heroBody:
        "Sandset convierte planes sueltos de WhatsApp en eventos claros: quien juega, donde, cuando y que falta.",
      primaryCta: "Ver eventos",
      secondaryCta: "Crear evento",
      visualLabel: "Partido activo",
      visualTitle: "2v2 en Barceloneta",
      visualMeta: "Hoy - 18:30 - 3/4 jugadores",
      visualChat: "Chat listo para coordinar llegada",
      visualResult: "Resultado validable al acabar",
      visualGear: "Pelota verificada",
      actionTitle: "Que puedes hacer?",
      actionBody: "Tres caminos rapidos segun lo que necesitas hoy.",
      actionCta: "Abrir",
      findTitle: "Encontrar donde jugar",
      findBody: "Lista, mapa y calendario para ver partidas cerca.",
      createTitle: "Crear una quedada",
      createBody: "Publica open play, partido privado o torneo.",
      competeTitle: "Competir y validar",
      competeBody: "Resultados aceptados, historial y rating.",
      privateTitle: "Controlar acceso",
      privateBody: "Links privados, solicitudes e invitaciones.",
      ecosystemEyebrow: "Mucho mas que crear partidos",
      ecosystemTitle: "Tu club social y competitivo de voley playa",
      ecosystemBody:
        "Encuentra gente, guarda rivales, propone mejoras y sigue tu progreso sin salir de la app.",
      friendsTitle: "Amigos",
      friendsBody: "Crea tu red para repetir equipo, retar rivales y no perder contactos.",
      ideasTitle: "Ideas",
      ideasBody: "Sugiere mejoras y vota que deberia construirse despues.",
      mapTitle: "Mapa",
      mapBody: "Explora pistas y eventos por zona, no solo por lista.",
      calendarTitle: "Calendario",
      calendarBody: "Ve que se juega esta semana y encaja tu siguiente partido.",
      rankingTitle: "Ranking",
      rankingBody: "Sigue resultados, nivel competitivo y evolucion.",
      profileTitle: "Perfil competitivo",
      profileBody: "Tu historial, rating y actividad quedan reunidos en un sitio.",
      statEvents: "Eventos",
      statMatches: "Partidos proximos",
      statPlayers: "Jugadores",
      statOpenPlay: "Open plays",
      flowTitle: "La app se entiende en 3 pasos",
      flowBody: "Menos texto, mas accion: de buscar partido a jugarlo.",
      stepOneTitle: "1. Mira el plan",
      stepOneBody: "Formato, pista, hora, plazas y visibilidad en una sola card.",
      stepTwoTitle: "2. Unete o pide acceso",
      stepTwoBody: "Abierto si es publico; solicitud si es privado.",
      stepThreeTitle: "3. Coordina y cierra",
      stepThreeBody: "Chat del evento, material, resultado e historial.",
      upcomingTitle: "Lo proximo que se juega",
      upcomingBody: "Eventos publicos reales visibles ahora mismo.",
      viewAllEvents: "Ver todos",
      loadingEvents: "Cargando eventos...",
      noEventsTitle: "Aun no hay eventos publicos",
      noEventsBody: "Cuando se publiquen partidos u open plays apareceran aqui.",
      finalTitle: "Tu siguiente partido no deberia perderse en un chat",
      finalBody:
        "Crea un evento claro y deja que los jugadores sepan exactamente como unirse.",
      finalCta: "Explorar eventos",
      profileCta: "Ir a mi perfil",
      footer:
        "Sandset organiza partidos, open plays, torneos y resultados de voley playa en un solo sitio.",
    };
  }

  return {
    seoTitle: "Sandset | Find and organize beach volleyball",
    seoDescription:
      "Find beach volleyball matches, create events, coordinate players and validate results with Sandset.",
    eyebrow: "Local beach volleyball, less chaos",
    heroTitle: "Find a match. Fill the court. Play.",
    heroBody:
      "Sandset turns scattered chat plans into clear events: who plays, where, when and what is missing.",
    primaryCta: "See events",
    secondaryCta: "Create event",
    visualLabel: "Active match",
    visualTitle: "2v2 in Barceloneta",
    visualMeta: "Today - 18:30 - 3/4 players",
    visualChat: "Event chat ready for arrival plans",
    visualResult: "Result validation after the match",
    visualGear: "Verified ball",
    actionTitle: "What can you do?",
    actionBody: "Three fast paths depending on what you need today.",
    actionCta: "Open",
    findTitle: "Find where to play",
    findBody: "List, map and calendar for nearby sessions.",
    createTitle: "Create a meetup",
    createBody: "Publish open play, private match or tournament.",
    competeTitle: "Compete and validate",
    competeBody: "Accepted results, history and rating.",
    privateTitle: "Control access",
    privateBody: "Private links, requests and invitations.",
    ecosystemEyebrow: "More than creating matches",
    ecosystemTitle: "Your social and competitive beach volleyball club",
    ecosystemBody:
      "Find people, save rivals, suggest improvements and track your progress without leaving the app.",
    friendsTitle: "Friends",
    friendsBody: "Build your network to repeat teams, challenge rivals and keep contacts.",
    ideasTitle: "Ideas",
    ideasBody: "Suggest improvements and vote what should be built next.",
    mapTitle: "Map",
    mapBody: "Explore courts and events by area, not only by list.",
    calendarTitle: "Calendar",
    calendarBody: "See what is playing this week and fit your next match.",
    rankingTitle: "Ranking",
    rankingBody: "Follow results, competitive level and progression.",
    profileTitle: "Competitive profile",
    profileBody: "Your history, rating and activity live in one place.",
    statEvents: "Events",
    statMatches: "Upcoming matches",
    statPlayers: "Players",
    statOpenPlay: "Open plays",
    flowTitle: "The app in 3 steps",
    flowBody: "Less reading, more action: from finding a match to playing it.",
    stepOneTitle: "1. Read the plan",
    stepOneBody: "Format, court, time, spots and visibility in one card.",
    stepTwoTitle: "2. Join or request",
    stepTwoBody: "Join directly when public; request access when private.",
    stepThreeTitle: "3. Coordinate and close",
    stepThreeBody: "Event chat, gear, result and history.",
    upcomingTitle: "What is playing next",
    upcomingBody: "Real public events currently visible in the app.",
    viewAllEvents: "View all",
    loadingEvents: "Loading events...",
    noEventsTitle: "No public events yet",
    noEventsBody: "New matches and open plays will appear here.",
    finalTitle: "Your next match should not disappear in a chat",
    finalBody:
      "Create a clear event and let players know exactly how to join.",
    finalCta: "Explore events",
    profileCta: "Go to my profile",
    footer:
      "Sandset organizes beach volleyball matches, open plays, tournaments and results in one place.",
  };
}

export function HomePage() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const {
    totalPlayers,
    loading,
    error,
    totalEvents,
    activeMatches,
    upcomingEvents,
    openPlayCount,
  } = useHomeData();
  const isSpanish =
    i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");
  const copy = useMemo(() => getHomeCopy(isSpanish), [isSpanish]);
  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${HOME_CANONICAL_URL}#software`,
        name: "Sandset",
        url: HOME_CANONICAL_URL,
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        inLanguage: i18n.language,
        description: copy.seoDescription,
        image: DEFAULT_OG_IMAGE,
        publisher: {
          "@type": "Organization",
          name: "Sandset",
          url: HOME_CANONICAL_URL,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        featureList: [
          copy.findTitle,
          copy.createTitle,
          copy.privateTitle,
          copy.competeTitle,
        ],
      },
    ],
    [copy, i18n.language]
  );

  usePageSeo({
    title: buildSeoTitle(copy.seoTitle),
    description: copy.seoDescription,
    canonicalPath: "/",
    image: DEFAULT_OG_IMAGE,
    structuredData,
  });

  const isInitialLoading =
    loading && !error && totalEvents === 0 && totalPlayers === 0;

  if (isInitialLoading) {
    return <AppLoadingScreen />;
  }

  const secondaryCta = isAuthenticated
    ? { label: copy.secondaryCta, to: "/events/create" }
    : { label: copy.secondaryCta, to: "/login?redirect=%2Fevents%2Fcreate" };
  const finalProfileCta = isAuthenticated
    ? { label: copy.profileCta, to: "/profile" }
    : { label: copy.secondaryCta, to: "/register" };
  const ideasLink = isAuthenticated
    ? "/feature-requests"
    : "/login?redirect=%2Ffeature-requests";
  const friendsLink = isAuthenticated ? "/friends" : "/login?redirect=%2Ffriends";
  const profileLink = isAuthenticated ? "/profile" : "/register";

  return (
    <section className="relative mx-auto flex w-full max-w-[1540px] flex-col gap-5 overflow-hidden px-3 pb-8 sm:px-5 lg:px-8 2xl:px-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#f7efe1] p-4 shadow-sm ring-1 ring-black/5 sm:p-6 lg:min-h-[620px] lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.95),transparent_24%),radial-gradient(circle_at_82%_20%,rgba(14,165,233,0.20),transparent_26%),radial-gradient(circle_at_70%_86%,rgba(16,185,129,0.18),transparent_28%)]" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-stretch">
          <div className="flex min-h-[520px] flex-col justify-between rounded-[1.75rem] bg-white/70 p-5 backdrop-blur-md ring-1 ring-white/80 sm:p-7">
            <div>
              <p className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white">
                {copy.eyebrow}
              </p>
              <h1 className="mt-6 max-w-[10ch] text-5xl font-black leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-7xl">
                {copy.heroTitle}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                {copy.heroBody}
              </p>
            </div>

            <div className="mt-7 grid gap-3 sm:flex">
              <Link
                to="/events"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                {copy.primaryCta}
                <ChevronRight size={17} />
              </Link>
              <Link
                to={secondaryCta.to}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Plus size={17} />
                {secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-rows-[1fr_auto]">
            <VisualMatchCard copy={copy} />

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <StatTile label={copy.statEvents} value={totalEvents} />
              <StatTile label={copy.statMatches} value={activeMatches} />
              <StatTile label={copy.statPlayers} value={totalPlayers} />
              <StatTile label={copy.statOpenPlay} value={openPlayCount} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-8 h-64 w-64 rounded-full bg-emerald-400/12 blur-3xl" />

          <div className="relative flex h-full min-h-96 flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
                Sandset
              </p>
              <h2 className="mt-4 max-w-[11ch] text-4xl font-black leading-none tracking-[-0.05em] sm:text-5xl">
                {copy.actionTitle}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
                {copy.actionBody}
              </p>
            </div>

            <div className="grid gap-3">
              <ActionPreviewRow
                icon={<Map size={18} />}
                label={copy.findTitle}
                meta={copy.primaryCta}
              />
              <ActionPreviewRow
                icon={<Plus size={18} />}
                label={copy.createTitle}
                meta={copy.secondaryCta}
              />
              <ActionPreviewRow
                icon={<Trophy size={18} />}
                label={copy.rankingTitle}
                meta={copy.competeTitle}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            icon={<Map size={22} />}
            title={copy.findTitle}
            body={copy.findBody}
            to="/events"
            tone="blue"
            actionLabel={copy.actionCta}
          />
          <ActionCard
            icon={<Plus size={22} />}
            title={copy.createTitle}
            body={copy.createBody}
            to={secondaryCta.to}
            tone="sand"
            actionLabel={copy.actionCta}
          />
          <ActionCard
            icon={<Trophy size={22} />}
            title={copy.competeTitle}
            body={copy.competeBody}
            to="/ranking"
            tone="emerald"
            actionLabel={copy.actionCta}
          />
          <ActionCard
            icon={<LockKeyhole size={22} />}
            title={copy.privateTitle}
            body={copy.privateBody}
            to="/events"
            tone="slate"
            actionLabel={copy.actionCta}
          />
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fff7ed_0%,#e0f2fe_46%,#dcfce7_100%)] p-5 shadow-sm ring-1 ring-black/5 sm:p-7 lg:p-8">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative grid gap-5 lg:grid-cols-[0.95fr_1.4fr] lg:items-stretch">
          <div className="flex min-h-80 flex-col justify-between rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">
                {copy.ecosystemEyebrow}
              </p>
              <h2 className="mt-5 max-w-[12ch] text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                {copy.ecosystemTitle}
              </h2>
            </div>
            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              {copy.ecosystemBody}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <EcosystemCard
              icon={<Users size={21} />}
              title={copy.friendsTitle}
              body={copy.friendsBody}
              to={friendsLink}
              tone="blue"
            />
            <EcosystemCard
              icon={<Lightbulb size={21} />}
              title={copy.ideasTitle}
              body={copy.ideasBody}
              to={ideasLink}
              tone="amber"
            />
            <EcosystemCard
              icon={<Map size={21} />}
              title={copy.mapTitle}
              body={copy.mapBody}
              to="/map"
              tone="emerald"
            />
            <EcosystemCard
              icon={<CalendarDays size={21} />}
              title={copy.calendarTitle}
              body={copy.calendarBody}
              to="/calendar"
              tone="sky"
            />
            <EcosystemCard
              icon={<Trophy size={21} />}
              title={copy.rankingTitle}
              body={copy.rankingBody}
              to="/ranking"
              tone="lime"
            />
            <EcosystemCard
              icon={<ShieldCheck size={21} />}
              title={copy.profileTitle}
              body={copy.profileBody}
              to={profileLink}
              tone="slate"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] p-6 shadow-sm ring-1 ring-blue-100 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
            Flow
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-slate-950">
            {copy.flowTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            {copy.flowBody}
          </p>

          <div className="mt-6 space-y-3">
            <FlowRow
              icon={<CalendarDays size={20} />}
              title={copy.stepOneTitle}
              body={copy.stepOneBody}
            />
            <FlowRow
              icon={<Users size={20} />}
              title={copy.stepTwoTitle}
              body={copy.stepTwoBody}
            />
            <FlowRow
              icon={<MessageCircle size={20} />}
              title={copy.stepThreeTitle}
              body={copy.stepThreeBody}
            />
          </div>
        </div>

        <div className="rounded-[2rem] bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_100%)] p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
                Live
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-slate-950">
                {copy.upcomingTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {copy.upcomingBody}
              </p>
            </div>
            <Link
              to="/events"
              className="hidden rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 sm:inline-flex"
            >
              {copy.viewAllEvents}
            </Link>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">{copy.loadingEvents}</p>
          ) : null}

          {error ? (
            <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          {!loading && !error && upcomingEvents.length === 0 ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <p className="font-black text-slate-950">{copy.noEventsTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {copy.noEventsBody}
              </p>
            </div>
          ) : null}

          {!loading && !error && upcomingEvents.length > 0 ? (
            <div className="mt-6 space-y-4">
              {upcomingEvents.map((event) => (
                <UpcomingEventItem key={event.id} event={event} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#0f766e_100%)] p-6 text-white shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              {copy.finalTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-blue-50/90 sm:text-base">
              {copy.finalBody}
            </p>
          </div>

          <div className="grid gap-3 sm:flex lg:grid lg:min-w-56">
            <Link
              to="/events"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100"
            >
              {copy.finalCta}
            </Link>
            <Link
              to={finalProfileCta.to}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
            >
              {finalProfileCta.label}
            </Link>
          </div>
        </div>
      </section>

      <footer className="rounded-[1.5rem] bg-slate-950/95 px-5 py-4 text-sm text-slate-300 shadow-sm ring-1 ring-slate-900">
        {copy.footer}
      </footer>
    </section>
  );
}

function EcosystemCard({
  icon,
  title,
  body,
  to,
  tone,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  to: string;
  tone: "blue" | "amber" | "emerald" | "sky" | "lime" | "slate";
}) {
  const tones = {
    blue: "from-blue-600 to-blue-800 text-blue-50",
    amber: "from-amber-500 to-orange-600 text-amber-50",
    emerald: "from-emerald-600 to-teal-800 text-emerald-50",
    sky: "from-sky-500 to-blue-700 text-sky-50",
    lime: "from-lime-500 to-emerald-700 text-lime-50",
    slate: "from-slate-800 to-slate-950 text-slate-50",
  };

  return (
    <Link
      to={to}
      className={`group flex min-h-48 flex-col justify-between rounded-[1.5rem] bg-gradient-to-br p-5 shadow-lg shadow-slate-950/5 transition hover:-translate-y-1 hover:shadow-xl ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/20">
          {icon}
        </span>
        <ChevronRight
          size={18}
          className="opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100"
        />
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-black tracking-[-0.02em]">{title}</h3>
        <p className="mt-2 text-sm leading-6 opacity-90">{body}</p>
      </div>
    </Link>
  );
}

function VisualMatchCard({ copy }: { copy: HomeCopy }) {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(59,130,246,0.55),transparent_28%),radial-gradient(circle_at_86%_28%,rgba(16,185,129,0.42),transparent_26%),linear-gradient(160deg,rgba(15,23,42,0.92),rgba(15,23,42,1))]" />
      <div className="absolute left-1/2 top-8 h-[78%] w-px -translate-x-1/2 bg-white/15" />
      <div className="absolute left-8 right-8 top-1/2 h-px bg-white/15" />

      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-100">
              {copy.visualLabel}
            </span>
            <span className="rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-black text-emerald-950">
              3 / 4
            </span>
          </div>

          <h2 className="mt-6 max-w-[9ch] text-5xl font-black leading-none tracking-[-0.05em] sm:text-6xl">
            {copy.visualTitle}
          </h2>
          <p className="mt-3 text-sm font-bold text-blue-100">
            {copy.visualMeta}
          </p>
        </div>

        <div className="grid gap-3">
          <VisualPill icon={<MessageCircle size={18} />} text={copy.visualChat} />
          <VisualPill icon={<Trophy size={18} />} text={copy.visualResult} />
          <VisualPill icon={<ShieldCheck size={18} />} text={copy.visualGear} />
        </div>
      </div>
    </div>
  );
}

function VisualPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 text-sm font-bold text-white backdrop-blur-md">
      <span className="text-blue-100">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] bg-white/80 p-4 shadow-sm ring-1 ring-white/70 backdrop-blur-md">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function ActionPreviewRow({
  icon,
  label,
  meta,
}: {
  icon: ReactNode;
  label: string;
  meta: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/14 text-blue-100">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-white">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-400">
          {meta}
        </span>
      </span>
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
    </div>
  );
}

function ActionCard({
  icon,
  title,
  body,
  to,
  tone,
  actionLabel,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  to: string;
  tone: "blue" | "sand" | "emerald" | "slate";
  actionLabel: string;
}) {
  const tones = {
    blue: {
      card: "from-blue-50 to-white ring-blue-100",
      icon: "bg-blue-600 text-white",
      ghost: "text-blue-100",
    },
    sand: {
      card: "from-amber-50 to-white ring-amber-100",
      icon: "bg-amber-500 text-white",
      ghost: "text-amber-100",
    },
    emerald: {
      card: "from-emerald-50 to-white ring-emerald-100",
      icon: "bg-emerald-600 text-white",
      ghost: "text-emerald-100",
    },
    slate: {
      card: "from-slate-100 to-white ring-slate-200",
      icon: "bg-slate-900 text-white",
      ghost: "text-slate-200",
    },
  };

  return (
    <Link
      to={to}
      className={`group relative flex min-h-52 overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-5 shadow-sm ring-1 transition hover:-translate-y-1 hover:shadow-lg ${tones[tone].card}`}
    >
      <div className={`absolute -right-6 -top-8 ${tones[tone].ghost}`}>
        <span className="block scale-[4.4] opacity-70">{icon}</span>
      </div>
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-slate-950/10 ${tones[tone].icon}`}
          >
            {icon}
          </div>
          <h3 className="mt-5 max-w-[14ch] text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950">
            {title}
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            {body}
          </p>
        </div>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-slate-900">
          {actionLabel}
          <ChevronRight
            size={16}
            className="transition group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

function FlowRow({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="grid grid-cols-[auto_1fr] gap-4 rounded-3xl bg-slate-50 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        {icon}
      </div>
      <div>
        <h3 className="font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{body}</p>
      </div>
    </article>
  );
}
