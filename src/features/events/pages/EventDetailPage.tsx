import { Link, useNavigate, useParams } from "react-router-dom";

const isAuthenticated = false;

export function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  function handleJoinEvent() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${eventId}`);
      return;
    }

    alert("Joined event!");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Match
        </span>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Sunday Beach Match
        </h1>

        <p className="mt-3 text-slate-600">
          Friendly beach volleyball match open to players of all levels.
        </p>

        <div className="mt-6 space-y-2 text-sm text-slate-600">
          <p>Date: Sunday, 10:00</p>
          <p>Location: Barceloneta Beach</p>
          <p>Participants: 4 / 8</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleJoinEvent}
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white"
          >
            Join Event
          </button>

          <Link
            to={`/events/${eventId}/edit`}
            className="rounded-xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-700"
          >
            Edit Event
          </Link>
        </div>
      </div>

      <aside className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Location</h2>
        <div className="mt-4 flex h-64 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          Map preview
        </div>
      </aside>
    </section>
  );
}