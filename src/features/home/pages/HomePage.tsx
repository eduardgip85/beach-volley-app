import {
  CalendarDays,
  ChevronRight,
  Globe,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Volleyball,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { HomeStatCard } from "../components/HomeStatCard";
import { UpcomingEventItem } from "../components/UpcomingEventItem";
import { useHomeData } from "../hooks/useHomeData";

export function HomePage() {
  const { t } = useTranslation();
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
  const faqItems = [
    { question: t("homeContent.faq1q"), answer: t("homeContent.faq1a") },
    { question: t("homeContent.faq2q"), answer: t("homeContent.faq2a") },
    { question: t("homeContent.faq3q"), answer: t("homeContent.faq3a") },
    { question: t("homeContent.faq4q"), answer: t("homeContent.faq4a") },
  ];
  const featureCards = [
    {
      icon: <Volleyball size={20} />,
      title: t("homeContent.feature1t"),
      description: t("homeContent.feature1d"),
    },
    {
      icon: <MapPin size={20} />,
      title: t("homeContent.feature2t"),
      description: t("homeContent.feature2d"),
    },
    {
      icon: <ShieldCheck size={20} />,
      title: t("homeContent.feature3t"),
      description: t("homeContent.feature3d"),
    },
    {
      icon: <Users size={20} />,
      title: t("homeContent.feature4t"),
      description: t("homeContent.feature4d"),
    },
  ];
  const useCases = [
    t("homeContent.useCase1"),
    t("homeContent.useCase2"),
    t("homeContent.useCase3"),
    t("homeContent.useCase4"),
  ];

  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");
    const existingJsonLd = document.getElementById("home-jsonld");

    document.title =
      "Beach Volley App | Beach volleyball matches, open play, private games and player stats";

    let descriptionTag = document.querySelector('meta[name="description"]');

    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.appendChild(descriptionTag);
    }

    descriptionTag.setAttribute(
      "content",
      "Beach Volley App helps players discover beach volleyball matches, open play sessions, private games, competitive ratings and public player profiles in one place."
    );

    const jsonLdScript = document.createElement("script");
    jsonLdScript.id = "home-jsonld";
    jsonLdScript.type = "application/ld+json";
    jsonLdScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Beach Volley App",
      applicationCategory: "SportsApplication",
      operatingSystem: "Web",
      description:
        "Beach Volley App helps players discover beach volleyball matches, open play sessions, private games, competitive ratings and public player profiles.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      featureList: [
        "Beach volleyball event discovery",
        "Open play and match organization",
        "Private event join requests",
        "Validated match results",
        "Competitive player rating",
        "Public player profiles",
      ],
    });
    document.head.appendChild(jsonLdScript);

    return () => {
      document.title = previousTitle;

      if (descriptionTag) {
        if (previousDescription) {
          descriptionTag.setAttribute("content", previousDescription);
        } else {
          descriptionTag.remove();
        }
      }

      jsonLdScript.remove();

      if (existingJsonLd) {
        document.head.appendChild(existingJsonLd);
      }
    };
  }, []);

  return (
    <section className="space-y-5 md:space-y-8">
      <div className="landing-fade-up overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-sm md:rounded-[2rem]">
        <div className="grid gap-6 px-4 py-5 sm:px-5 sm:py-6 md:grid-cols-[1.2fr_0.8fr] md:gap-10 md:px-10 md:py-12">
          <div className="relative">
            <div className="landing-glow-pulse absolute left-0 top-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="landing-float-fast absolute bottom-3 right-2 hidden h-20 w-20 rounded-full bg-cyan-400/10 blur-2xl sm:block" />

            <div className="relative landing-fade-up-delay-1">
              <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 sm:text-xs sm:tracking-[0.25em]">
                <Globe size={14} />
                {t("home.platformEyebrow")}
              </p>

              <h1 className="mt-4 max-w-4xl text-[2rem] font-black leading-tight text-white sm:text-[2.4rem] md:mt-6 md:text-6xl">
                {t("home.heroTitle")}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base md:mt-6 md:text-lg md:leading-8">
                {t("home.heroBody")}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-8">
                <Link
                  to="/events"
                  className="rounded-2xl bg-blue-500 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-600"
                >
                  {t("home.exploreEvents")}
                </Link>

                {isAuthenticated ? (
                  <Link
                    to="/events/create"
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-center font-bold text-white transition hover:bg-white/10"
                  >
                    {t("home.createEvent")}
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-center font-bold text-white transition hover:bg-white/10"
                  >
                    {t("home.joinApp")}
                  </Link>
                )}
              </div>

              <div className="mt-6 grid gap-3 md:mt-8 sm:grid-cols-3">
                <TrustPill
                  icon={<Volleyball size={16} />}
                  label={t("home.trustStructuredMatches")}
                />
                <TrustPill
                  icon={<Users size={16} />}
                  label={t("home.trustOpenPlay")}
                />
                <TrustPill
                  icon={<Trophy size={16} />}
                  label={t("home.trustCompetition")}
                />
              </div>
            </div>
          </div>

          <div className="landing-fade-up-delay-2 grid gap-3 md:gap-4">
            <div className="landing-float-slow rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur md:rounded-[1.75rem] md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200 md:text-sm md:tracking-[0.2em]">
                {t("home.whyEyebrow")}
              </p>
              <h2 className="mt-3 text-xl font-black text-white md:text-2xl">
                {t("home.whyTitle")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {t("home.whyBody")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
              <div className="landing-float-fast rounded-[1.5rem] bg-emerald-400 p-5 text-slate-950 md:rounded-[1.75rem] md:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] md:text-xs md:tracking-[0.2em]">
                  {t("home.publicDiscovery")}
                </p>
                <p className="mt-3 text-xl font-black md:text-2xl">
                  {t("home.publicDiscoveryBody")}
                </p>
              </div>

              <div className="landing-float-slow rounded-[1.5rem] bg-amber-300 p-5 text-slate-950 md:rounded-[1.75rem] md:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] md:text-xs md:tracking-[0.2em]">
                  {t("home.privateFlow")}
                </p>
                <p className="mt-3 text-xl font-black md:text-2xl">
                  {t("home.privateFlowBody")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-fade-up-delay-1 grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
        <HomeStatCard
          icon={<CalendarDays />}
          label={t("home.statPublicEvents")}
          value={totalEvents}
        />
        <HomeStatCard
          icon={<Volleyball />}
          label={t("home.statUpcomingMatches")}
          value={activeMatches}
        />
        <HomeStatCard
          icon={<Users />}
          label={t("home.statPlayers")}
          value={totalPlayers}
        />
        <HomeStatCard
          icon={<Sparkles />}
          label={t("home.statOpenPlay")}
          value={openPlayCount}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] md:gap-6">
        <div className="landing-fade-up rounded-[1.75rem] bg-white p-5 shadow-sm md:rounded-[2rem] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 md:text-sm md:tracking-[0.2em]">
            {t("home.whatEyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
            {t("home.whatTitle")}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            {t("home.whatBody")}
          </p>

          <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-2 md:gap-4">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md md:p-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-base font-black text-slate-950 md:text-lg">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

          <div className="landing-fade-up-delay-1 space-y-5 md:space-y-6">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm md:rounded-[2rem] md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 md:text-sm md:tracking-[0.2em]">
              {t("home.howEyebrow")}
            </p>
            <div className="mt-5 space-y-4">
              <StepCard
                number="01"
                title={t("homeContent.step1t")}
                description={t("homeContent.step1d")}
              />
              <StepCard
                number="02"
                title={t("homeContent.step2t")}
                description={t("homeContent.step2d")}
              />
              <StepCard
                number="03"
                title={t("homeContent.step3t")}
                description={t("homeContent.step3d")}
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-slate-900 p-5 text-white shadow-sm md:rounded-[2rem] md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300 md:text-sm md:tracking-[0.2em]">
              {t("home.bestForEyebrow")}
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              {useCases.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="landing-fade-up-delay-2 rounded-[1.75rem] bg-white p-5 shadow-sm md:rounded-[2rem] md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 md:text-sm md:tracking-[0.2em]">
              {t("home.upcomingEyebrow")}
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
              {t("home.upcomingTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              {t("home.upcomingBody")}
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-100 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
          >
            {t("home.viewAllEvents")}
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">{t("home.loadingEvents")}</p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {!loading && !error && upcomingEvents.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
            <p className="font-black text-slate-950">{t("home.noPublicEvents")}</p>
            <p className="mt-2 text-sm text-slate-500">
              {t("home.noPublicEventsBody")}
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
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] md:gap-6">
        <div className="landing-fade-up rounded-[1.75rem] bg-blue-600 p-5 text-white shadow-sm md:rounded-[2rem] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100 md:text-sm md:tracking-[0.2em]">
            {t("home.competitiveEyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-black md:text-3xl">
            {t("home.competitiveTitle")}
          </h2>
          <p className="mt-4 text-sm leading-7 text-blue-50">
            {t("home.competitiveBody")}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:mt-8">
            <MetricNote
              title={t("homeContent.metric1t")}
              description={t("homeContent.metric1d")}
            />
            <MetricNote
              title={t("homeContent.metric2t")}
              description={t("homeContent.metric2d")}
            />
          </div>
        </div>

        <div className="landing-fade-up-delay-1 rounded-[1.75rem] bg-white p-5 shadow-sm md:rounded-[2rem] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 md:text-sm md:tracking-[0.2em]">
            {t("home.faqEyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
            {t("home.faqTitle")}
          </h2>

          <div className="mt-6 space-y-4">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
              >
                <h3 className="text-lg font-black text-slate-950">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

function TrustPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 md:p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600 md:text-xs md:tracking-[0.2em]">
        {number}
      </p>
      <h3 className="mt-3 text-base font-black text-slate-950 md:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function MetricNote({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 md:p-5">
      <h3 className="text-base font-black md:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-blue-50">{description}</p>
    </div>
  );
}
