import { Link } from "react-router-dom";

export function EventsPage() {
  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="mt-2 text-slate-500">
            Explore beach volleyball matches and tournaments.
          </p>
        </div>

        <Link
          to="/events/create"
          className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white"
        >
          Create Event
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            Match
          </span>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Sunday Beach Match
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Barceloneta Beach · 10:00
          </p>

          <p className="mt-4 text-sm text-slate-600">4 / 8 players joined</p>

          <Link
            to="/events/demo-event"
            className="mt-5 inline-block text-sm font-medium text-blue-600"
          >
            View details
          </Link>
        </article>
      </div>
    </section>
  );
}