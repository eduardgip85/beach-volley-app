import type { AnalyticsTimeFilter } from "../types/stats.types";

const filterOptions: Array<{ value: AnalyticsTimeFilter; label: string }> = [
  { value: "last_7_days", label: "7 days" },
  { value: "last_30_days", label: "30 days" },
  { value: "last_90_days", label: "90 days" },
  { value: "all_time", label: "All time" },
];

interface AnalyticsFilterTabsProps {
  value: AnalyticsTimeFilter;
  onChange: (value: AnalyticsTimeFilter) => void;
}

export function AnalyticsFilterTabs({
  value,
  onChange,
}: AnalyticsFilterTabsProps) {
  return (
    <div className="sticky top-16 z-10 -mx-1 overflow-x-auto pb-1 md:static md:mx-0 md:overflow-visible">
      <div className="inline-flex min-w-full gap-2 rounded-2xl bg-slate-200/80 p-1 sm:min-w-0">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition sm:px-4 sm:py-2.5 sm:text-sm",
              value === option.value
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-950",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
