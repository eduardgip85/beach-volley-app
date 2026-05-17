import { Globe2, HelpCircle, ShieldCheck, Swords, Trophy } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { RankingLegendModal } from "../components/RankingLegendModal";
import { RankingPlayerCard } from "../components/RankingPlayerCard";
import { RankingTabs } from "../components/RankingTabs";
import { useRanking } from "../hooks/useRanking";

export function RankingPage() {
    const [showLegend, setShowLegend] = useState(false);
    const { isAuthenticated, profile } = useAuth();
    const { 
        scope,
        setScope,
        scopeLabel,
        players,
        loading,
        error,
        emptyMessage,
        hasCountryScope,
        hasFriendsScope,
    } = useRanking({
        isAuthenticated,
        country: profile?.country ?? null,
    });

    return (
        <section className="space-y-6 md:space-y-8">
            <div className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-sm">
                <div className="bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1)_0%,_rgba(2,6,23,1)_100%)] px-5 py-6 sm:px-6 md:px-8 md:py-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-300">
                                Competitive ranking
                            </p>
                            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                                Track the strongest beach volleyball players
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                                Explore the global leaderboard, compare players from your
                                country, and see how you stack up against friends. Ratings
                                update only from accepted competitive matches.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="rounded-2xl bg-white/10 px-3 py-3 text-center text-white backdrop-blur">
                                <Trophy className="mx-auto text-blue-300" size={18} />
                                <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-300">
                                    Scope
                                </p>
                                <p className="mt-1 text-sm font-black">{scopeLabel}</p>
                            </div>

                            <div className="rounded-2xl bg-white/10 px-3 py-3 text-center text-white backdrop-blur">
                                <Swords className="mx-auto text-blue-300" size={18} />
                                <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-300">
                                    Players
                                </p>
                                <p className="mt-1 text-sm font-black">{players.length}</p>
                            </div>

                            <div className="rounded-2xl bg-white/10 px-3 py-3 text-center text-white backdrop-blur">
                                <ShieldCheck className="mx-auto text-blue-300" size={18} />
                                <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-300">
                                    Rules
                                </p>
                                <p className="mt-1 text-sm font-black">0.00 - 10.00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RankingTabs
                activeScope={scope}
                onScopeChange={setScope}
                hasCountryScope={hasCountryScope}
                hasFriendsScope={hasFriendsScope}
            />

            <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-slate-900">
                                {scopeLabel} leaderboard
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowLegend((current) => !current)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                                aria-label="Show rating legend"
                            >
                                <HelpCircle size={16} />
                            </button>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {scope === "global"
                                ? "All accepted competitive results contribute to this live ranking."
                                : scope === "country"
                                ? `Ranking filtered by ${profile?.country ?? "your profile country"}.`
                                : "Only accepted friends are included in this comparison."}
                        </p>
                    </div>

                    {scope === "friends" && !isAuthenticated ? (
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
                        >
                            Log in for friends ranking
                        </Link>
                    ) : null}

                    {scope === "country" && !hasCountryScope ? (
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                            <Globe2 size={16} />
                            Add your country later to unlock this view
                        </div>
                    ) : null}
                </div>

                {loading ? (
                    <div className="mt-6 grid gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-40 animate-pulse rounded-[1.75rem] bg-slate-100"
                            />
                        ))}
                    </div>
                ) : null}

                {error ? (
                    <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                ) : null}

                {!loading && !error && players.length === 0 ? (
                    <div className="mt-6 rounded-[1.75rem] bg-slate-50 px-5 py-8 text-center sm:px-8">
                        <p className="text-lg font-black text-slate-900">
                            Ranking not ready yet
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {emptyMessage}
                        </p>
                    </div>
                ) : null}

                {!loading && !error && players.length > 0 ? (
                    <div className="mt-6 grid gap-4">
                        {players.map((player) => (
                            <RankingPlayerCard key={player.profileId} player={player} />
                        ))}
                    </div>
                ) : null}
            </div>

            <RankingLegendModal
                open={showLegend}
                onClose={() => setShowLegend(false)}
            />
        </section>
    );
}
