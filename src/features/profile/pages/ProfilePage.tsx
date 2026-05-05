import {
  BarChart3,
  CalendarDays,
  Mail,
  Shield,
  Trophy,
  User,
  Users,
  LogOut,
  MapPin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useProfileEvents } from "../hooks/useProfileEvents";

export function ProfilePage() {

  const navigate = useNavigate();
  const { isAdmin, profile, logout } = useAuth();

  const {
    upcomingEvents,
    // pastEvents,
    loading,
    error,
  } = useProfileEvents(profile?.id);
  if (!profile) {
    return <p className="text-slate-500">Loading profile...</p>;
  }

  async function handleLogout() {
      try {
          await logout();
          navigate("/login", { replace: true });
      } catch (error) {
          console.error("Logout error:", error);
      }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-row justify-between">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-black text-white">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>

            <button
            onClick={handleLogout}
            className="md:hidden flex items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-600 text-white bg-red-500"
            >
                <LogOut size={18} />
                Logout
            </button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {profile.fullName}
            </h1>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <Mail size={15} />
                {profile.email}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 font-semibold capitalize text-blue-700">
                <Shield size={15} />
                {profile.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/events" className="rounded-3xl bg-white p-6 shadow-sm hover:-translate-y-1 hover:bg-slate-200 hover:shadow-md">
          <Trophy className="text-blue-600" />
          <h2 className="mt-4 font-bold text-slate-900">Explore events</h2>
          <p className="mt-2 text-sm text-slate-500">
            Find matches and tournaments.
          </p>
        </Link>

        <Link to="/events/create" className="rounded-3xl bg-white p-6 shadow-sm hover:-translate-y-1 hover:bg-slate-200 hover:shadow-md">
          <CalendarDays className="text-blue-600" />
          <h2 className="mt-4 font-bold text-slate-900">Create event</h2>
          <p className="mt-2 text-sm text-slate-500">
            Organize a new beach volleyball event.
          </p>
        </Link>

        <Link to="/calendar" className="rounded-3xl bg-white p-6 shadow-sm hover:-translate-y-1 hover:bg-slate-200 hover:shadow-md">
          <User className="text-blue-600" />
          <h2 className="mt-4 font-bold text-slate-900">Calendar</h2>
          <p className="mt-2 text-sm text-slate-500">
            Review upcoming activities.
          </p>
        </Link>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming events</h2>
          </div>

          <Link to="/events" className="text-sm font-bold text-blue-600 bg-blue-200 hover:bg-blue-600 hover:text-white p-2 rounded-xl">
            Explore more
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Loading your events...</p>
        )}

        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && upcomingEvents.length === 0 && (
          <div className="rounded-3xl bg-slate-50 p-6 text-center">
            <p className="font-bold text-slate-900">No joined events yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Join a match or tournament and it will appear here.
            </p>
          </div>
        )}

        {!loading && !error && upcomingEvents.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:bg-blue-50"
              >
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    event.type === "match"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {event.type}
                </span>

                <h3 className="mt-4 font-bold text-slate-900">{event.title}</h3>

                <div className="mt-3 space-y-2 text-sm text-slate-500">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {new Date(event.startDate).toLocaleString()}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin size={16} />
                    {event.locationName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>



      {isAdmin && (
        <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-300">
            Admin area
          </p>

          <h2 className="mt-3 text-2xl font-bold">Management tools</h2>

          <p className="mt-2 text-slate-300">
            Access internal dashboards to manage users, events and platform
            statistics.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link
              to="/stats"
              className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
            >
              <BarChart3 />
              <h3 className="mt-4 font-bold">Statistics</h3>
              <p className="mt-2 text-sm text-slate-300">
                View platform analytics.
              </p>
            </Link>

            <Link
              to="/admin/users"
              className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
            >
              <Users />
              <h3 className="mt-4 font-bold">Manage users</h3>
              <p className="mt-2 text-sm text-slate-300">
                Review registered users.
              </p>
            </Link>

            <Link
              to="/admin/events"
              className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15"
            >
              <Trophy />
              <h3 className="mt-4 font-bold">Manage events</h3>
              <p className="mt-2 text-sm text-slate-300">
                Control all platform events.
              </p>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}