import {
  BarChart3,
  CalendarDays,
  Mail,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

export function ProfilePage() {
  const { profile, isAdmin } = useAuth();

  if (!profile) {
    return <p className="text-slate-500">Loading profile...</p>;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-black text-white">
            {profile.fullName.charAt(0).toUpperCase()}
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
        <Link to="/events" className="rounded-3xl bg-white p-6 shadow-sm">
          <Trophy className="text-blue-600" />
          <h2 className="mt-4 font-bold text-slate-900">Explore events</h2>
          <p className="mt-2 text-sm text-slate-500">
            Find matches and tournaments.
          </p>
        </Link>

        <Link to="/events/create" className="rounded-3xl bg-white p-6 shadow-sm">
          <CalendarDays className="text-blue-600" />
          <h2 className="mt-4 font-bold text-slate-900">Create event</h2>
          <p className="mt-2 text-sm text-slate-500">
            Organize a new beach volleyball event.
          </p>
        </Link>

        <Link to="/calendar" className="rounded-3xl bg-white p-6 shadow-sm">
          <User className="text-blue-600" />
          <h2 className="mt-4 font-bold text-slate-900">Calendar</h2>
          <p className="mt-2 text-sm text-slate-500">
            Review upcoming activities.
          </p>
        </Link>
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