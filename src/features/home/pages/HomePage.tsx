import {
  CalendarDays,
  ChevronRight,
  Globe,
  Map,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Volleyball,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { HomeStatCard } from "../components/HomeStatCard";
import { UpcomingEventItem } from "../components/UpcomingEventItem";
import { useHomeData } from "../hooks/useHomeData";

gsap.registerPlugin(ScrollTrigger);

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

  const pageRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const featureCardsRef = useRef<HTMLDivElement[]>([]);
  const upcomingRef = useRef<HTMLDivElement | null>(null);

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
      surfaceClass:
        "border-blue-100 bg-[linear-gradient(180deg,_rgba(239,246,255,0.96)_0%,_rgba(255,255,255,0.98)_100%)]",
      iconClass: "bg-blue-100 text-blue-700",
    },
    {
      icon: <MapPin size={20} />,
      title: t("homeContent.feature2t"),
      description: t("homeContent.feature2d"),
      surfaceClass:
        "border-amber-100 bg-[linear-gradient(180deg,_rgba(255,251,235,0.94)_0%,_rgba(255,255,255,0.98)_100%)]",
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: t("homeContent.feature3t"),
      description: t("homeContent.feature3d"),
      surfaceClass:
        "border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.94)_0%,_rgba(255,255,255,0.98)_100%)]",
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: <Users size={20} />,
      title: t("homeContent.feature4t"),
      description: t("homeContent.feature4d"),
      surfaceClass:
        "border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.98)_0%,_rgba(255,255,255,1)_100%)]",
      iconClass: "bg-slate-100 text-slate-700",
    },
  ];

  const mapCalendarCards = [
    {
      icon: <Volleyball size={18} />,
      title: t("home.discoveryListTitle"),
      body: t("home.discoveryListBody"),
      to: "/events",
      cta: t("home.discoveryListCta"),
      accent:
        "border-blue-100 bg-blue-50/80 text-blue-700 ring-1 ring-blue-100/70",
    },
    {
      icon: <Map size={18} />,
      title: t("home.discoveryMapTitle"),
      body: t("home.discoveryMapBody"),
      to: "/map",
      cta: t("home.discoveryMapCta"),
      accent:
        "border-emerald-100 bg-emerald-50/80 text-emerald-700 ring-1 ring-emerald-100/70",
    },
    {
      icon: <CalendarDays size={18} />,
      title: t("home.discoveryCalendarTitle"),
      body: t("home.discoveryCalendarBody"),
      to: "/calendar",
      cta: t("home.discoveryCalendarCta"),
      accent:
        "border-amber-100 bg-amber-50/80 text-amber-700 ring-1 ring-amber-100/70",
    },
  ];

  const aiCards = [
    {
      icon: <Volleyball size={18} />,
      title: t("home.aiBallTitle"),
      body: t("home.aiBallBody"),
      accent: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: <ShieldCheck size={18} />,
      title: t("home.aiNetTitle"),
      body: t("home.aiNetBody"),
      accent: "bg-blue-100 text-blue-700",
    },
    {
      icon: <Sparkles size={18} />,
      title: t("home.aiProfileTitle"),
      body: t("home.aiProfileBody"),
      accent: "bg-amber-100 text-amber-700",
    },
  ];

  const secondaryCta = isAuthenticated
    ? {
        label: t("home.createEvent"),
        to: "/events/create",
      }
    : {
        label: t("home.joinApp"),
        to: "/register",
      };

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

  useEffect(() => {
    if (!pageRef.current) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll("[data-hero-item]"), {
          opacity: 0,
          y: 28,
          duration: 0.85,
          ease: "power2.out",
          stagger: 0.1,
        });
      }

      if (sectionsRef.current.length > 0) {
        gsap.from(sectionsRef.current, {
          opacity: 0,
          y: 34,
          duration: 0.75,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionsRef.current[0],
            start: "top 78%",
          },
        });
      }

      if (featureCardsRef.current.length > 0) {
        gsap.from(featureCardsRef.current, {
          opacity: 0,
          y: 24,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featureCardsRef.current[0],
            start: "top 82%",
          },
        });
      }

      if (statsRef.current) {
        gsap.from(statsRef.current.querySelectorAll("[data-stat-card]"), {
          opacity: 0,
          y: 22,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 82%",
          },
        });
      }

      if (upcomingRef.current) {
        gsap.from(upcomingRef.current.querySelectorAll("[data-upcoming-item]"), {
          opacity: 0,
          y: 24,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: upcomingRef.current,
            start: "top 80%",
          },
        });
      }
    }, pageRef);

    return () => {
      ctx.revert();
    };
  }, [activeMatches, openPlayCount, totalEvents, totalPlayers, upcomingEvents.length]);

  return (
    <section
      ref={pageRef}
      className="relative overflow-x-clip"
    >
      <div className="relative mx-auto flex min-w-0 w-full max-w-[1680px] flex-col gap-5 px-3 py-3 sm:px-5 sm:py-5 md:gap-8 lg:px-8 xl:px-10">
        <section
          ref={heroRef}
          className="min-w-0 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_rgba(255,255,255,0.9)_0%,_rgba(255,255,255,0.82)_48%,_rgba(239,246,255,0.86)_100%)] px-4 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-white/80 backdrop-blur-md sm:px-6 md:rounded-[2.8rem] md:px-8 md:py-10 xl:px-12 xl:py-12"
        >
          <div className="grid min-w-0 gap-6 lg:min-h-[520px] lg:grid-cols-[minmax(0,1.18fr)_minmax(480px,0.82fr)] lg:items-center lg:gap-12 xl:gap-16">
            <div className="min-w-0 max-w-3xl">
              <p
                data-hero-item
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700 sm:text-[11px]"
              >
                <Globe size={14} />
                {t("home.platformEyebrow")}
              </p>

              <h1
                data-hero-item
                className="mt-4 max-w-[14ch] break-words text-[2.35rem] font-black leading-[0.98] tracking-[-0.03em] text-slate-950 sm:max-w-none sm:text-[2.65rem] md:text-[3.35rem] xl:text-[4.4rem]"
              >
                {t("home.heroTitle")}
              </h1>

              <p
                data-hero-item
                className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-slate-600 sm:text-base xl:text-[1.05rem]"
              >
                {t("home.heroBody")}
              </p>

              <div
                data-hero-item
                className="mt-6 grid gap-3 sm:flex sm:flex-row"
              >
                <Link
                  to="/events"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
                >
                  {t("home.exploreEvents")}
                  <ChevronRight size={16} />
                </Link>

                <Link
                  to={secondaryCta.to}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                >
                  {secondaryCta.label}
                </Link>
              </div>

              <div
                data-hero-item
                className="mt-3 grid grid-cols-3 gap-2.5 sm:hidden"
              >
                <Link
                  to="/events"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center text-xs font-bold text-slate-700 shadow-sm"
                >
                  {t("nav.events")}
                </Link>
                <Link
                  to="/map"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center text-xs font-bold text-slate-700 shadow-sm"
                >
                  {t("nav.map")}
                </Link>
                <Link
                  to="/calendar"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center text-xs font-bold text-slate-700 shadow-sm"
                >
                  {t("nav.calendar")}
                </Link>
              </div>

              <div
                data-hero-item
                className="mt-5 flex flex-wrap gap-2.5"
              >
                <TrustPill
                  icon={<Volleyball size={15} />}
                  label={t("home.trustStructuredMatches")}
                />
                <TrustPill
                  icon={<Users size={15} />}
                  label={t("home.trustOpenPlay")}
                />
                <TrustPill
                  icon={<Trophy size={15} />}
                  label={t("home.trustCompetition")}
                />
              </div>
            </div>

            <div
              data-hero-item
              className="relative mx-auto mt-1 min-w-0 w-full max-w-full sm:max-w-[560px] lg:mx-0 lg:mt-0 lg:justify-self-end"
            >
              <div className="absolute -left-6 top-6 h-32 w-32 rounded-full bg-blue-200/50 blur-3xl" />
              <div className="absolute -right-6 bottom-8 h-28 w-28 rounded-full bg-emerald-200/40 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                    <Trophy size={14} />
                    {t("home.heroMockType")}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                    <ShieldCheck size={14} />
                    {t("home.heroMockVerified")}
                  </span>
                </div>

                <div className="mt-3 rounded-[1.75rem] bg-[linear-gradient(160deg,_#0f172a_0%,_#1d4ed8_58%,_#0f766e_100%)] p-4 text-white shadow-[0_24px_60px_rgba(29,78,216,0.28)] sm:rounded-[2rem] sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                    SandSet
                  </p>
                  <h3 className="mt-2 text-[1.7rem] font-black sm:text-[2rem]">
                    Sunset Beach Match
                  </h3>
                  <p className="mt-2 max-w-sm text-[0.92rem] leading-6 text-blue-50/90">
                    {t("home.heroMockBody")}
                  </p>

                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    <MockMetric
                      icon={<MapPin size={16} />}
                      label={t("home.heroMockLocationLabel")}
                      value="Barceloneta"
                    />
                    <MockMetric
                      icon={<CalendarDays size={16} />}
                      label={t("home.heroMockDateLabel")}
                      value="21 May | 18:30"
                    />
                    <MockMetric
                      icon={<Users size={16} />}
                      label={t("home.heroMockPlayersLabel")}
                      value="3 / 4"
                    />
                    <MockMetric
                      icon={<Volleyball size={16} />}
                      label={t("home.heroMockEquipmentLabel")}
                      value={t("home.heroMockEquipmentValue")}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                  <MiniInfoCard
                    title={t("home.heroMockMiniOneTitle")}
                    body={t("home.heroMockMiniOneBody")}
                  />
                  <MiniInfoCard
                    title={t("home.heroMockMiniTwoTitle")}
                    body={t("home.heroMockMiniTwoBody")}
                  />
                  <MiniInfoCard
                    title={t("home.heroMockMiniThreeTitle")}
                    body={t("home.heroMockMiniThreeBody")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          ref={statsRef}
          className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4"
        >
          <div data-stat-card>
            <HomeStatCard
              icon={<CalendarDays />}
              label={t("home.statPublicEvents")}
              value={totalEvents}
            />
          </div>
          <div data-stat-card>
            <HomeStatCard
              icon={<Volleyball />}
              label={t("home.statUpcomingMatches")}
              value={activeMatches}
            />
          </div>
          <div data-stat-card>
            <HomeStatCard
              icon={<Users />}
              label={t("home.statPlayers")}
              value={totalPlayers}
            />
          </div>
          <div data-stat-card>
            <HomeStatCard
              icon={<Sparkles />}
              label={t("home.statOpenPlay")}
              value={openPlayCount}
            />
          </div>
        </div>

        <div
          ref={(element) => {
            if (element) {
              sectionsRef.current[0] = element;
            }
          }}
          className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:p-6 md:p-8">
            <SectionEyebrow>{t("home.whyEyebrow")}</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
              {t("home.whyTitle")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              {t("home.whyBody")}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ProblemCard
                title={t("home.problemCardTitle")}
                items={[
                  t("home.problemItemOne"),
                  t("home.problemItemTwo"),
                  t("home.problemItemThree"),
                ]}
                tone="problem"
              />
              <ProblemCard
                title={t("home.solutionCardTitle")}
                items={[
                  t("home.solutionItemOne"),
                  t("home.solutionItemTwo"),
                  t("home.solutionItemThree"),
                ]}
                tone="solution"
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-amber-100/80 bg-[linear-gradient(180deg,_rgba(255,251,235,0.88)_0%,_rgba(255,255,255,0.99)_100%)] p-5 shadow-[0_12px_32px_rgba(245,158,11,0.08)] sm:p-6 md:p-8">
            <SectionEyebrow>{t("home.howEyebrow")}</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
              {t("home.howTitle")}
            </h2>
            <div className="mt-6 space-y-4">
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
          </section>
        </div>

        <section
          ref={(element) => {
            if (element) {
              sectionsRef.current[1] = element;
            }
          }}
          className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.92)_0%,_rgba(255,255,255,1)_100%)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6 md:p-8"
        >
          <div className="max-w-3xl">
            <SectionEyebrow>{t("home.whatEyebrow")}</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
              {t("home.whatTitle")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {t("home.whatBody")}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature, index) => (
              <div
                key={feature.title}
                ref={(element) => {
                  if (element) {
                    featureCardsRef.current[index] = element;
                  }
                }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  surfaceClass={feature.surfaceClass}
                  iconClass={feature.iconClass}
                />
              </div>
            ))}
          </div>
        </section>

        <section
          ref={upcomingRef}
          className="rounded-[2rem] border border-blue-200/80 bg-white p-5 shadow-[0_12px_34px_rgba(59,130,246,0.07)] sm:p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <SectionEyebrow>{t("home.upcomingEyebrow")}</SectionEyebrow>
              <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
                {t("home.upcomingTitle")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
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
                <div key={event.id} data-upcoming-item>
                  <UpcomingEventItem event={event} />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div
          ref={(element) => {
            if (element) {
              sectionsRef.current[2] = element;
            }
          }}
          className="grid gap-5 lg:grid-cols-[1fr_1fr]"
        >
          <section className="rounded-[2rem] border border-blue-100/80 bg-[linear-gradient(180deg,_rgba(239,246,255,0.9)_0%,_rgba(255,255,255,0.99)_100%)] p-5 shadow-[0_12px_34px_rgba(59,130,246,0.08)] sm:p-6 md:p-8">
            <SectionEyebrow>{t("home.discoveryEyebrow")}</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
              {t("home.discoveryTitle")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {t("home.discoveryBody")}
            </p>

            <div className="mt-6 grid gap-4">
              {mapCalendarCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.to}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className={`inline-flex rounded-2xl p-3 ${card.accent}`}>
                    {card.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {card.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700">
                    {card.cta}
                    <ChevronRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-emerald-200/80 bg-white p-5 shadow-[0_12px_34px_rgba(16,185,129,0.07)] sm:p-6 md:p-8">
            <SectionEyebrow>{t("home.aiEyebrow")}</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
              {t("home.aiTitle")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {t("home.aiBody")}
            </p>

            <div className="mt-6 space-y-4">
              {aiCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className={`inline-flex rounded-2xl p-3 ${card.accent}`}>
                    {card.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div
          ref={(element) => {
            if (element) {
              sectionsRef.current[3] = element;
            }
          }}
          className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <section className="rounded-[2rem] bg-[linear-gradient(155deg,_#0f172a_0%,_#1d4ed8_58%,_#0f766e_100%)] p-5 text-white shadow-sm sm:p-6 md:p-8">
            <SectionEyebrow dark>{t("home.competitiveEyebrow")}</SectionEyebrow>
            <h2 className="mt-3 text-2xl font-black md:text-3xl">
              {t("home.competitiveTitle")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-blue-50/90">
              {t("home.competitiveBody")}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MetricNote
                title={t("homeContent.metric1t")}
                description={t("homeContent.metric1d")}
              />
              <MetricNote
                title={t("homeContent.metric2t")}
                description={t("homeContent.metric2d")}
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99)_0%,_rgba(248,250,252,0.95)_100%)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6 md:p-8">
            <SectionEyebrow>{t("home.faqEyebrow")}</SectionEyebrow>
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
          </section>
        </div>

        <section
          ref={(element) => {
            if (element) {
              sectionsRef.current[4] = element;
            }
          }}
          className="overflow-hidden rounded-[2rem] border border-blue-100/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99)_0%,_rgba(239,246,255,0.95)_100%)] p-5 shadow-[0_14px_36px_rgba(59,130,246,0.07)] sm:p-6 md:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <SectionEyebrow>{t("home.finalCtaEyebrow")}</SectionEyebrow>
              <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
                {t("home.finalCtaTitle")}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {t("home.finalCtaBody")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                to="/events"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                {t("home.exploreEvents")}
              </Link>

              <Link
                to={isAuthenticated ? "/profile" : "/register"}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {isAuthenticated ? t("home.finalCtaProfile") : t("home.joinApp")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function SectionEyebrow({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.2em] ${
        dark ? "text-blue-100" : "text-blue-600"
      }`}
    >
      {children}
    </p>
  );
}

function TrustPill({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
      <span className="shrink-0 text-blue-600">{icon}</span>
      <span className="truncate sm:whitespace-normal">{label}</span>
    </div>
  );
}

function MockMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
      <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">
        {icon}
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function MiniInfoCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">{body}</p>
    </div>
  );
}

function ProblemCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "problem" | "solution";
}) {
  const dotClass =
    tone === "problem" ? "bg-amber-500" : "bg-emerald-500";
  const surfaceClass =
    tone === "problem"
      ? "border-amber-100 bg-amber-50/70"
      : "border-emerald-100 bg-emerald-50/70";

  return (
    <div className={`rounded-3xl border p-5 ${surfaceClass}`}>
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-7 text-slate-700">
            <span className={`mt-2 h-2.5 w-2.5 rounded-full ${dotClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  surfaceClass,
  iconClass,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  surfaceClass: string;
  iconClass: string;
}) {
  return (
    <article
      className={`rounded-3xl border p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)] ${surfaceClass}`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </article>
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
    <div className="rounded-3xl border border-white/70 bg-white/76 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] ring-1 ring-amber-100/70 backdrop-blur-sm">
      <p className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
        {number}
      </p>
      <h3 className="mt-3 text-lg font-black text-slate-950">{title}</h3>
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
    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
      <h3 className="text-base font-black">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-blue-50/90">{description}</p>
    </div>
  );
}
