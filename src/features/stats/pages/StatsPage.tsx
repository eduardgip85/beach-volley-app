export function StatsPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-900">Admin Statistics</h1>
      <p className="mt-2 text-slate-500">
        Global event analytics for administrators.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total events</p>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active events</p>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Registrations</p>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
      </div>
    </section>
  );
}