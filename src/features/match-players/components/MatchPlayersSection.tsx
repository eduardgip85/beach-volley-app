import { ArrowRightLeft, Shield, UserMinus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MatchPlayer, MatchTeam } from "../types/matchPlayer.types";

interface MatchPlayersSectionProps {
    teamAPlayers: MatchPlayer[];
    teamBPlayers: MatchPlayer[];
    loading: boolean;
    actionLoadingId: string | null;
    error: string;
    isManager: boolean;
    currentUserId?: string;
    onAssignTeam: (userId: string, team: MatchTeam) => Promise<void>;
    onRemove: (userId: string) => Promise<void>;
}

function TeamColumn({
    title,
    team,
    players,
    actionLoadingId,
    isManager,
    currentUserId,
    onAssignTeam,
    onRemove,
}: {
    title: string;
    team: MatchTeam;
    players: MatchPlayer[];
    actionLoadingId: string | null;
    isManager: boolean;
    currentUserId?: string;
    onAssignTeam: (userId: string, team: MatchTeam) => Promise<void>;
    onRemove: (userId: string) => Promise<void>;
}) {
    const { t } = useTranslation();
    const oppositeTeam = team === "team_a" ? "team_b" : "team_a";

    return (
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase text-slate-600 ring-1 ring-slate-200">
                    {players.length}/2
                </span>
            </div>

            <div className="mt-4 space-y-3">
                {players.map((player) => {
                    const isAssigning =
                        actionLoadingId === `assign:${player.userId}:${oppositeTeam}`;
                    const isRemoving =
                        actionLoadingId === `remove:${player.userId}`;

                    return (
                        <div
                            key={player.id}
                            className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
                                    {player.profile.fullName.charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate font-bold text-slate-900">
                                    {player.profile.fullName}
                                        {player.userId === currentUserId
                                            ? ` (${t("matchPlayers.you")})`
                                            : ""}
                                    </p>
                                </div>
                            </div>

                            {isManager && (
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => onAssignTeam(player.userId, oppositeTeam)}
                                        disabled={isAssigning || isRemoving}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                    >
                                        <ArrowRightLeft size={16} />
                                        {isAssigning
                                            ? t("matchPlayers.moving")
                                            : oppositeTeam === "team_a"
                                              ? t("matchPlayers.moveToTeamA")
                                              : t("matchPlayers.moveToTeamB")}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onRemove(player.userId)}
                                        disabled={isAssigning || isRemoving}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-60"
                                    >
                                        <UserMinus size={16} />
                                        {isRemoving
                                            ? t("matchPlayers.removing")
                                            : t("matchPlayers.remove")}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, index) => (
                    <div
                        key={`${team}-empty-${index}`}
                        className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-400"
                    >
                        {t("matchPlayers.emptySlot")}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MatchPlayersSection({
    teamAPlayers,
    teamBPlayers,
    loading,
    actionLoadingId,
    error,
    isManager,
    currentUserId,
    onAssignTeam,
    onRemove,
}: MatchPlayersSectionProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Users size={22} />
                </span>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {t("matchPlayers.title")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {t("matchPlayers.subtitle")}
                    </p>
                </div>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-slate-500">
                    {t("matchPlayers.loading")}
                </p>
            ) : null}

            {error ? (
                <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            ) : null}

            {!loading && (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <TeamColumn
                        title={t("matchPlayers.teamA")}
                        team="team_a"
                        players={teamAPlayers}
                        actionLoadingId={actionLoadingId}
                        isManager={isManager}
                        currentUserId={currentUserId}
                        onAssignTeam={onAssignTeam}
                        onRemove={onRemove}
                    />
                    <TeamColumn
                        title={t("matchPlayers.teamB")}
                        team="team_b"
                        players={teamBPlayers}
                        actionLoadingId={actionLoadingId}
                        isManager={isManager}
                        currentUserId={currentUserId}
                        onAssignTeam={onAssignTeam}
                        onRemove={onRemove}
                    />
                </div>
            )}

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Shield size={16} />
                    {t("matchPlayers.formatTitle")}
                </div>
                <p className="mt-2">
                    {t("matchPlayers.formatBody")}
                </p>
            </div>
        </div>
    );
}
