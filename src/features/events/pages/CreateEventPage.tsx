export function CreateEventPage() {
  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Create Event</h1>

      <form className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <input
          placeholder="Event title"
          className="w-full rounded-xl border px-4 py-3"
        />

        <textarea
          placeholder="Description"
          className="min-h-32 w-full rounded-xl border px-4 py-3"
        />

        <select className="w-full rounded-xl border px-4 py-3">
          <option value="">Select type</option>
          <option value="match">Match</option>
          <option value="tournament">Tournament</option>
        </select>

        <input type="datetime-local" className="w-full rounded-xl border px-4 py-3" />

        <input
          type="number"
          placeholder="Max participants"
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          placeholder="Location name"
          className="w-full rounded-xl border px-4 py-3"
        />

        <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          Map picker
        </div>

        <button className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white">
          Create Event
        </button>
      </form>
    </section>
  );
}