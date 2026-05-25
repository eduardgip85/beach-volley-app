import { useTranslation } from "react-i18next";
import type { AnalyticsTimeFilter } from "../types/stats.types";

interface AnalyticsFilterTabsProps {
  value: AnalyticsTimeFilter;
  onChange: (value: AnalyticsTimeFilter) => void;
}

export function AnalyticsFilterTabs({
  value,
  onChange,
}: AnalyticsFilterTabsProps) {
  const { t } = useTranslation();
  const filterOptions: Array<{ value: AnalyticsTimeFilter; label: string }> = [
    { value: "last_7_days", label: t("adminStats.filters.last7Days") },
    { value: "last_30_days", label: t("adminStats.filters.last30Days") },
    { value: "last_90_days", label: t("adminStats.filters.last90Days") },
    { value: "all_time", label: t("adminStats.filters.allTime") },
  ];

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
