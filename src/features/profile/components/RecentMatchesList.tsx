import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getEventBadgeClasses, getEventModeLabel } from "../../events/utils/event-display.utils";
import type { ProfileRecentMatch } from "../types/profileStats.types";

interface RecentMatchesListProps {
    matches: ProfileRecentMatch[];
    loading?: boolean;
    title?: string;
    description?: string;
    emptyTitle?: string;
    emptyDescription?: string;
}

export function RecentMatchesList({
    matches,
    loading = false,
    title = "Last 5 matches",
    description = "Showing your latest validated match results.",
    emptyTitle = "No recent validated matches yet",
    emptyDescription = "Once a joined match has an accepted result, it will appear here.",
}: RecentMatchesListProps) {
    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {description}
                    </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                    Validated only
                </span>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-slate-500">Loading recent matches...</p>
            ) : null}

            {!loading && matches.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">{emptyTitle}</p>
                    <p className="mt-2 text-sm text-slate-500">
                        {emptyDescription}
                    </p>
                </div>
            ) : null}

            {!loading && matches.length > 0 ? (
                <div className="mt-6 space-y-4">
                    {matches.map(({ event, result, outcome }) => {
                        const modeLabel = getEventModeLabel(event.mode);
                        const isWin = outcome === "win";

                        return (
                            <Link
                                key={result.id}
                                to={`/events/${event.id}`}
                                className={`block rounded-3xl border p-5 transition ${
                                    isWin
                                        ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70"
                                        : "border-red-200 bg-red-50 hover:bg-red-100/70"
                                }`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                                                    event
                                                )}`}
                                            >
                                                Match
                                            </span>

                                            {modeLabel ? (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                                    {modeLabel}
                                                </span>
                                            ) : null}

                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                                                <ShieldCheck size={14} />
                                                Validated
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                                    isWin
                                                        ? "bg-emerald-600 text-white"
                                                        : "bg-red-600 text-white"
                                                }`}
                                            >
                                                {isWin ? "Won" : "Lost"}
                                            </span>
                                        </div>

                                        <h3 className="mt-4 text-lg font-bold text-slate-900">
                                            {event.title}
                                        </h3>

                                        <div className="mt-3 space-y-2 text-sm text-slate-500">
                                            <p className="flex items-center gap-2">
                                                <CalendarDays size={16} />
                                                {new Date(event.startDate).toLocaleString()}
                                            </p>

                                            <p className="flex items-center gap-2">
                                                <MapPin size={16} />
                                                {event.locationName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="min-w-[180px] space-y-2 rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200">
                                        {result.sets.map((set) => (
                                            <div
                                                key={set.id}
                                                className="flex items-center justify-between text-sm text-slate-700"
                                            >
                                                <span className="font-semibold text-slate-500">
                                                    Set {set.setNumber}
                                                </span>
                                                <span className="font-black text-slate-900">
                                                    {set.teamAScore} - {set.teamBScore}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
