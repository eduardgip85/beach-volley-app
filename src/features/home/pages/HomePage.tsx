import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Trophy,
  Users,
  Volleyball,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useHomeData } from "../hooks/useHomeData";

import { HomeStatCard } from "../components/HomeStatCard";
import { HomeShortCut } from "../components/HomeShortCut";
import { UpcomingEventItem } from "../components/UpcomingEventItem";

export function HomePage() {
  const { isAuthenticated } = useAuth();

  const {
    totalPlayers,
    loading,
    error,
    totalEvents,
    activeMatches,
    upcomingEvents,
  } = useHomeData();

  return (
    <section className="space-y-8">
      {/* STATS */}
      <div className="grid gap-2 md:grid-cols-3">
        <HomeStatCard
          icon={<CalendarDays />}
          label="Total events"
          value={totalEvents}
        />

        <HomeStatCard
          icon={<Volleyball />}
          label="Active matches"
          value={activeMatches}
        />

        <HomeStatCard
          icon={<Users />}
          label="Total Players"
          value={totalPlayers}
        />
      </div>

      {/* HERO */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Beach volley community
            </p>

            <h1 className="mt-4 text-4xl font-black md:text-6xl">
              Find matches, join tournaments.
            </h1>

            <p className="mt-6 text-slate-600">
              Discover beach volleyball events and play with others.
            </p>

            <div className="mt-6 flex gap-3">
              <Link to="/events" className="btn-primary bg-blue-500 text-white hover:bg-blue-700 hover:text-white px-6 py-3 font-bold rounded-2xl">
                Explore
              </Link>

              {isAuthenticated && (
                <Link to="/events/create" className="btn-secondary bg-slate-300 text-slate-800 hover:bg-slate-500 hover:text-white px-6 py-3 font-bold rounded-2xl">
                  Create
                </Link>
              )}
            </div>
          </div>

          <img
            src="/tournament-beach-2.png"
            className="rounded-2xl object-cover"
          />
        </div>
      </div>

      {/* SHORTCUTS */}
      <div
        className={`grid gap-4 ${
          isAuthenticated ? "md:grid-cols-4" : "md:grid-cols-3"
        }`}
      >
        <HomeShortCut
          to="/events"
          icon={<Trophy />}
          title="Events"
          description="Browse events"
        />
        <HomeShortCut
          to="/map"
          icon={<MapPin />}
          title="Map"
          description="Find locations"
        />
        <HomeShortCut
          to="/calendar"
          icon={<CalendarDays />}
          title="Calendar"
          description="View schedule"
        />

        {isAuthenticated && (
          <HomeShortCut
            to="/profile"
            icon={<Users />}
            title="Profile"
            description="Your account"
          />
        )}
      </div>

      {/* UPCOMING */}
      <section>
        <div className="flex justify-between py-5">
          <h2 className="text-2xl font-bold p-3">Upcoming Events</h2>

          <Link to="/events" className="flex items-center text-blue-600 hover:bg-blue-100 p-3 rounded-2xl font-bold">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <UpcomingEventItem key={event.id} event={event} />
          ))}
        </div>
      </section>
    </section>
  );
}