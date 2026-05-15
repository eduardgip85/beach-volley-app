import { useEffect, useMemo, useState } from "react";
import {
    assignPlayerToTeam,
    getMatchPlayers,
    joinMatch,
    leaveMatch,
    removePlayerFromMatch,
} from "../services/matchPlayers.service";
import type { MatchPlayer, MatchTeam } from "../types/matchPlayer.types";
import { getActiveMatchPlayers } from "../utils/matchPlayers.utils";

interface UseMatchPlayersOptions {
    eventType?: string;
    currentUserId?: string;
    isManager?: boolean;
}

export function useMatchPlayers(
    eventId?: string,
    options: UseMatchPlayersOptions = {}
) {
    const { eventType, currentUserId, isManager = false } = options;

    const [players, setPlayers] = useState<MatchPlayer[]>([]);
    const [loading, setLoading] = useState(eventType === "match");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    function getErrorMessage(err: unknown, fallback: string) {
        if (err instanceof Error && err.message) {
            return err.message;
        }

        if (
            err &&
            typeof err === "object" &&
            "message" in err &&
            typeof err.message === "string"
        ) {
            return err.message;
        }

        return fallback;
    }

    async function refresh() {
        if (!eventId || eventType !== "match") {
            setPlayers([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const data = await getMatchPlayers(eventId);
            setPlayers(data);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Could not load match players"));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, [eventId, eventType]);

    const activePlayers = useMemo(() => getActiveMatchPlayers(players), [players]);
    const teamAPlayers = useMemo(
        () => activePlayers.filter((player) => player.team === "team_a"),
        [activePlayers]
    );
    const teamBPlayers = useMemo(
        () => activePlayers.filter((player) => player.team === "team_b"),
        [activePlayers]
    );
    const currentPlayer = useMemo(
        () => activePlayers.find((player) => player.userId === currentUserId) ?? null,
        [activePlayers, currentUserId]
    );
    const isFull = activePlayers.length >= 4;

    async function runMutation(
        loadingId: string,
        action: () => Promise<unknown>
    ) {
        try {
            setActionLoadingId(loadingId);
            setError("");
            await action();
            await refresh();
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Could not update match players"));
        } finally {
            setActionLoadingId(null);
        }
    }

    return {
        state: {
            players,
            activePlayers,
            teamAPlayers,
            teamBPlayers,
            currentPlayer,
            loading,
            actionLoadingId,
            error,
            isFull,
            canJoin: Boolean(currentUserId && !currentPlayer && !isFull),
            canLeave: Boolean(currentPlayer),
            isManager,
        },
        actions: {
            refresh,
            join: () =>
                runMutation(`join:${currentUserId}`, () =>
                    joinMatch(eventId!, currentUserId!)
                ),
            leave: () =>
                runMutation(`leave:${currentUserId}`, () =>
                    leaveMatch(eventId!, currentUserId!)
                ),
            assignTeam: (userId: string, team: MatchTeam) =>
                runMutation(`assign:${userId}:${team}`, () =>
                    assignPlayerToTeam(eventId!, userId, team)
                ),
            remove: (userId: string) =>
                runMutation(`remove:${userId}`, () =>
                    removePlayerFromMatch(eventId!, userId)
                ),
        },
    };
}
