import type { CompetitiveInsightsFilter } from "../types/profileCompetitiveInsights.types";

const filterOptions: Array<{
    value: CompetitiveInsightsFilter;
    label: string;
}> = [
    { value: "last_5_matches", label: "Last 5" },
    { value: "last_10_matches", label: "Last 10" },
    { value: "last_30_days", label: "30 days" },
    { value: "all_time", label: "All time" },
];

interface CompetitiveInsightsFiltersProps {
    selectedFilter: CompetitiveInsightsFilter;
    onChange: (value: CompetitiveInsightsFilter) => void;
}

export function CompetitiveInsightsFilters({
    selectedFilter,
    onChange,
}: CompetitiveInsightsFiltersProps) {
    return (
        <div className="overflow-x-auto pb-1">
            <div className="inline-flex min-w-full gap-2 rounded-full bg-slate-100 p-1 sm:min-w-0">
                {filterOptions.map((option) => {
                    const isSelected = selectedFilter === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`rounded-full px-4 py-2 text-xs font-bold uppercase whitespace-nowrap transition ${
                                isSelected
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-white"
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
