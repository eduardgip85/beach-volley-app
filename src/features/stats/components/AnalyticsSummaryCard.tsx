interface AnalyticsSummaryCardProps {
  label: string;
  value: string | number;
  accent?: "blue" | "emerald" | "amber" | "rose" | "slate";
  helper?: string;
}

const accentClasses: Record<NonNullable<AnalyticsSummaryCardProps["accent"]>, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function AnalyticsSummaryCard({
  label,
  value,
  accent = "blue",
  helper,
}: AnalyticsSummaryCardProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div
        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ${accentClasses[accent]}`}
      >
        {label}
      </div>

      <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>

      {helper && <p className="mt-2 text-sm text-slate-500">{helper}</p>}
    </div>
  );
}
