import { CalendarDays, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import type {
  EventFiltersState,
  EventModeFilter,
  EventTypeFilter,
} from "../../features/events/hooks/useEventFilters";

interface EventFiltersProps {
  filters: EventFiltersState;
  locations: string[];
  showMyEventsFilter?: boolean;
  onFilterChange: <K extends keyof EventFiltersState>(
    key: K,
    value: EventFiltersState[K]
  ) => void;
  onClearFilters: () => void;
}

export function EventFilters({
  filters,
  locations,
  showMyEventsFilter = false,
  onFilterChange,
  onClearFilters,
}: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasFilters =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.mode !== "all" ||
    filters.location !== "all" ||
    filters.date !== "" ||
    filters.myEventsOnly;

  return (
    <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm sm:p-5">
      {/* Mobile search + toggle */}
      <div className="flex gap-3 lg:hidden">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onFilterChange("search", event.target.value)}
            placeholder="Search events..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white"
        >
          <ChevronDown
            size={20}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Mobile hidden filters */}
      {isOpen && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:hidden">
          <FiltersContent
            filters={filters}
            locations={locations}
            showMyEventsFilter={showMyEventsFilter}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            hasFilters={hasFilters}
          />
        </div>
      )}

      {/* Desktop filters */}
      <div className="hidden gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_150px_150px_180px_180px_auto_auto]">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onFilterChange("search", event.target.value)}
            placeholder="Search events..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <FiltersContent
          filters={filters}
          locations={locations}
          showMyEventsFilter={showMyEventsFilter}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          hasFilters={hasFilters}
        />
      </div>
    </div>
  );
}

function FiltersContent({
  filters,
  locations,
  showMyEventsFilter = false,
  onFilterChange,
  onClearFilters,
  hasFilters,
}: EventFiltersProps & { hasFilters: boolean }) {
  return (
    <>
      <select
        value={filters.type}
        onChange={(event) =>
          onFilterChange("type", event.target.value as EventTypeFilter)
        }
        className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
      >
        <option value="all">All Types</option>
        <option value="match">Match</option>
        <option value="open_play">Open Play</option>
      </select>

      <select
        value={filters.mode}
        onChange={(event) =>
          onFilterChange("mode", event.target.value as EventModeFilter)
        }
        className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
      >
        <option value="all">All Formats</option>
        <option value="casual">Casual</option>
        <option value="competitive">Competitive</option>
      </select>

      <select
        value={filters.location}
        onChange={(event) => onFilterChange("location", event.target.value)}
        className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
      >
        <option value="all">All Locations</option>

        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
        <input
          type="date"
          value={filters.date}
          onChange={(event) => onFilterChange("date", event.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none"
        />
        <CalendarDays size={17} className="text-slate-400" />
      </div>

      {showMyEventsFilter ? (
        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={filters.myEventsOnly}
            onChange={(event) =>
              onFilterChange("myEventsOnly", event.target.checked)
            }
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          My events
        </label>
      ) : null}

      <button
        type="button"
        onClick={onClearFilters}
        disabled={!hasFilters}
        className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Clear
      </button>
    </>
  );
}
