import { CalendarDays, MapPin, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Beach volley community
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Find matches, join tournaments and play beach volleyball.
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              Discover active beach volleyball events, check locations on the
              map and organize your next match with other players.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/events"
                className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white shadow-sm hover:bg-blue-700"
              >
                Explore events
              </Link>

              {isAuthenticated && (
                <Link
                  to="/events/create"
                  className="rounded-2xl bg-blue-50 px-6 py-4 text-center font-bold text-blue-700 hover:bg-blue-700"
                >
                  Create event
                </Link>
              )}
            </div>
          </div>

          <div className="relative min-h-72 overflow-hidden rounded-[2rem] bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200"
              alt="Beach volleyball"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${isAuthenticated ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        <Link to="/events" className="rounded-3xl bg-white p-6 shadow-sm hover:bg-gray-200">
          <Trophy className="text-blue-600" />
          <h2 className="mt-4 font-bold text-slate-900">Events</h2>
          <p className="mt-2 text-sm text-slate-500">
            Browse matches and tournaments.
          </p>
        </Link>

        <Link to="/map" className="rounded-3xl bg-white p-6 shadow-sm hover:bg-gray-200">
          <MapPin className="text-blue-600" />
          <h2 className="mt-4 font-bold text-slate-900">Map</h2>
          <p className="mt-2 text-sm text-slate-500">
            Find events by location.
          </p>
        </Link>

        <Link to="/calendar" className="rounded-3xl bg-white p-6 shadow-sm hover:bg-gray-200">
          <CalendarDays className="text-blue-600" />
          <h2 className="mt-4 font-bold text-slate-900">Calendar</h2>
          <p className="mt-2 text-sm text-slate-500">
            Check upcoming events.
          </p>
        </Link>

        {isAuthenticated && (
          <Link to="/profile" className="rounded-3xl bg-white p-6 shadow-sm hover:bg-gray-200">
            <Users className="text-blue-600" />
            <h2 className="mt-4 font-bold text-slate-900">Profile</h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage your account.
            </p>
          </Link>
        )}
      </div>
    </section>
  );
}