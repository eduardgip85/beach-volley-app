import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section>
      <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Beach volley events platform
        </p>

        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
          Find, create and join beach volleyball events.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Discover matches and tournaments near you, explore them on a map and
          check upcoming events from the calendar.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/events"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white"
          >
            Explore events
          </Link>

          <Link
            to="/events/create"
            className="rounded-xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-700"
          >
            Create event
          </Link>
        </div>
      </div>
    </section>
  );
}