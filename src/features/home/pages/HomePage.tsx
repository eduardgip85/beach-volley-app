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
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { HomeStatCard } from "../components/HomeStatCard";
import { UpcomingEventItem } from "../components/UpcomingEventItem";
import { useHomeData } from "../hooks/useHomeData";

const faqItems = [
  {
    question: "What is Beach Volley App?",
    answer:
      "Beach Volley App is a platform to discover beach volleyball matches, open play sessions, private games and competitive events in one place.",
  },
  {
    question: "Who is it for?",
    answer:
      "It is built for casual players, competitive duos, local communities and organizers who want a cleaner way to coordinate beach volleyball games.",
  },
  {
    question: "What can you do inside the app?",
    answer:
      "You can explore public events, join matches, request access to private games, track validated results, manage friends and build a competitive profile over time.",
  },
  {
    question: "How do competitive matches work?",
    answer:
      "Competitive matches use team assignment, result submission, opponent validation and Elo-based rating updates once the final result is accepted.",
  },
];

const featureCards = [
  {
    icon: <Volleyball size={20} />,
    title: "Organize real beach volleyball matches",
    description:
      "Create structured 2v2 matches or flexible open play sessions with clear visibility, capacity and location details.",
  },
  {
    icon: <MapPin size={20} />,
    title: "Find courts and sessions faster",
    description:
      "Use the map and calendar views to spot nearby games, check schedules and decide where to play next.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Validate results with more trust",
    description:
      "Competitive match results are reviewed by the opposing side, so stats and rating progress are tied to accepted results.",
  },
  {
    icon: <Users size={20} />,
    title: "Build your player network",
    description:
      "Send friend requests, open public player profiles and keep a better overview of the people you play with regularly.",
  },
];

const useCases = [
  "Discover upcoming beach volleyball matches without jumping between chats and spreadsheets.",
  "Run private matches with approval-based access instead of posting links publicly.",
  "Keep your profile history, recent matches and equipment badges in one place.",
  "Give local players a clearer way to join, validate and revisit completed matches.",
];

export function HomePage() {
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
                Beach volleyball platform
              </p>

              <h1 className="mt-4 max-w-4xl text-[2rem] font-black leading-tight text-white sm:text-[2.4rem] md:mt-6 md:text-6xl">
                Find beach volleyball matches, join open play sessions and track
                competitive progress in one place.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base md:mt-6 md:text-lg md:leading-8">
                Beach Volley App is a web app for local beach volleyball
                communities that want a cleaner way to discover events, manage
                private sessions, validate match results and keep player profiles
                organized beyond chat groups.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-8">
                <Link
                  to="/events"
                  className="rounded-2xl bg-blue-500 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-600"
                >
                  Explore events
                </Link>

                {isAuthenticated ? (
                  <Link
                    to="/events/create"
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-center font-bold text-white transition hover:bg-white/10"
                  >
                    Create an event
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-center font-bold text-white transition hover:bg-white/10"
                  >
                    Join the app
                  </Link>
                )}
              </div>

              <div className="mt-6 grid gap-3 md:mt-8 sm:grid-cols-3">
                <TrustPill
                  icon={<Volleyball size={16} />}
                  label="Structured matches"
                />
                <TrustPill
                  icon={<Users size={16} />}
                  label="Open play meetups"
                />
                <TrustPill
                  icon={<Trophy size={16} />}
                  label="Validated competition"
                />
              </div>
            </div>
          </div>

          <div className="landing-fade-up-delay-2 grid gap-3 md:gap-4">
            <div className="landing-float-slow rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur md:rounded-[1.75rem] md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200 md:text-sm md:tracking-[0.2em]">
                Why this app exists
              </p>
              <h2 className="mt-3 text-xl font-black text-white md:text-2xl">
                Built to make local beach volleyball easier to organize
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                The goal is simple: reduce friction around finding players,
                filling matches, handling private access, validating results and
                revisiting recent games without scattered tools.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
              <div className="landing-float-fast rounded-[1.5rem] bg-emerald-400 p-5 text-slate-950 md:rounded-[1.75rem] md:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] md:text-xs md:tracking-[0.2em]">
                  Public discovery
                </p>
                <p className="mt-3 text-xl font-black md:text-2xl">
                  Find nearby matches and open play sessions.
                </p>
              </div>

              <div className="landing-float-slow rounded-[1.5rem] bg-amber-300 p-5 text-slate-950 md:rounded-[1.75rem] md:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] md:text-xs md:tracking-[0.2em]">
                  Private flow
                </p>
                <p className="mt-3 text-xl font-black md:text-2xl">
                  Share private events with controlled join requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-fade-up-delay-1 grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
        <HomeStatCard
          icon={<CalendarDays />}
          label="Public events"
          value={totalEvents}
        />
        <HomeStatCard
          icon={<Volleyball />}
          label="Upcoming matches"
          value={activeMatches}
        />
        <HomeStatCard
          icon={<Users />}
          label="Players"
          value={totalPlayers}
        />
        <HomeStatCard
          icon={<Sparkles />}
          label="Open play sessions"
          value={openPlayCount}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] md:gap-6">
        <div className="landing-fade-up rounded-[1.75rem] bg-white p-5 shadow-sm md:rounded-[2rem] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 md:text-sm md:tracking-[0.2em]">
            What you can do
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
            A clearer workflow for beach volleyball communities
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Beach Volley App combines event discovery, private coordination,
            player profiles and validated results in one place, so both casual
            communities and competitive players can manage games with less
            friction.
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
              How it works
            </p>
            <div className="mt-5 space-y-4">
              <StepCard
                number="01"
                title="Browse public events"
                description="Explore public matches and open play sessions on the events page, map or calendar."
              />
              <StepCard
                number="02"
                title="Join or request access"
                description="Join open events directly or request access to private matches through their shared link."
              />
              <StepCard
                number="03"
                title="Play and validate"
                description="For match events, teams, results and validation make the final outcome clearer and more trustworthy."
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-slate-900 p-5 text-white shadow-sm md:rounded-[2rem] md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300 md:text-sm md:tracking-[0.2em]">
              Best for
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
              Upcoming beach volleyball events
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
              Public sessions you can join next
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              These are the nearest public events currently visible in the app.
              Use them to discover what the community is playing and how the
              platform works in practice.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-100 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
          >
            View all events
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading public events...</p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {!loading && !error && upcomingEvents.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
            <p className="font-black text-slate-950">No public events yet</p>
            <p className="mt-2 text-sm text-slate-500">
              As new matches and open play sessions are published, they will
              appear here.
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
            Competitive layer
          </p>
          <h2 className="mt-3 text-2xl font-black md:text-3xl">
            More than just event listings
          </h2>
          <p className="mt-4 text-sm leading-7 text-blue-50">
            Beach Volley App is also prepared for competitive play. Match events
            support team assignment, set-based results, opposing-side validation
            and competitive rating updates when the final result is accepted.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:mt-8">
            <MetricNote
              title="Validated results"
              description="Competitive stats only count once the result is accepted."
            />
            <MetricNote
              title="Player profiles"
              description="Profiles highlight recent matches, equipment badges and competitive progress."
            />
          </div>
        </div>

        <div className="landing-fade-up-delay-1 rounded-[1.75rem] bg-white p-5 shadow-sm md:rounded-[2rem] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 md:text-sm md:tracking-[0.2em]">
            Frequently asked
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">
            Quick answers about the platform
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
