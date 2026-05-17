export function StatsLoadingSkeleton() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
          >
            <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-9 w-20 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-3 h-4 w-32 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-100"
          >
            <div className="h-6 w-44 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-2 h-4 w-64 max-w-full animate-pulse rounded-xl bg-slate-100" />
            <div className="mt-6 h-64 animate-pulse rounded-3xl bg-slate-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
