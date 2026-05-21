import { useEffect, useState } from "react";
import { t } from "i18next";
import { getPublicEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { supabase } from "../../../config/supabase";

const TOTAL_PLAYERS_CACHE_TTL_MS = 60_000;
const HOME_DATA_CACHE_TTL_MS = 60_000;

interface HomeDataSnapshot {
    events: Event[];
    totalPlayers: number;
}

let totalPlayersCache:
    | {
          value: number;
          expiresAt: number;
      }
    | null = null;
let totalPlayersInflightRequest: Promise<number> | null = null;
let homeDataCache:
    | {
          value: HomeDataSnapshot;
          expiresAt: number;
      }
    | null = null;
let homeDataInflightRequest: Promise<HomeDataSnapshot> | null = null;

async function getTotalPlayers() {
    if (totalPlayersCache && totalPlayersCache.expiresAt > Date.now()) {
        return totalPlayersCache.value;
    }

    if (totalPlayersInflightRequest) {
        return totalPlayersInflightRequest;
    }

    totalPlayersInflightRequest = (async () => {
    const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    if (error) throw error;

        const nextCount = count ?? 0;

        totalPlayersCache = {
            value: nextCount,
            expiresAt: Date.now() + TOTAL_PLAYERS_CACHE_TTL_MS,
        };

        return nextCount;
    })();

    try {
        return await totalPlayersInflightRequest;
    } finally {
        totalPlayersInflightRequest = null;
    }
}

function getCachedHomeData() {
    if (!homeDataCache) {
        return null;
    }

    if (homeDataCache.expiresAt <= Date.now()) {
        return null;
    }

    return homeDataCache.value;
}

async function getHomeDataSnapshot() {
    const cachedHomeData = getCachedHomeData();

    if (cachedHomeData) {
        return cachedHomeData;
    }

    if (homeDataInflightRequest) {
        return homeDataInflightRequest;
    }

    homeDataInflightRequest = (async () => {
        const [events, totalPlayers] = await Promise.all([
            getPublicEvents(),
            getTotalPlayers(),
        ]);

        const nextSnapshot = {
            events,
            totalPlayers,
        };

        homeDataCache = {
            value: nextSnapshot,
            expiresAt: Date.now() + HOME_DATA_CACHE_TTL_MS,
        };

        return nextSnapshot;
    })();

    try {
        return await homeDataInflightRequest;
    } finally {
        homeDataInflightRequest = null;
    }
}

export function useHomeData() {
    const initialSnapshot = getCachedHomeData();
    const [events, setEvents] = useState<Event[]>(initialSnapshot?.events ?? []);
    const [totalPlayers, setTotalPlayers] = useState(initialSnapshot?.totalPlayers ?? 0);
    const [loading, setLoading] = useState(!initialSnapshot);
    const [error, setError] = useState("");

    useEffect(() => {
        let isCancelled = false;

        async function loadHomeData() {
            const hasVisibleData =
                (initialSnapshot?.events.length ?? 0) > 0 || Boolean(initialSnapshot);

            try {
                if (!hasVisibleData) {
                    setLoading(true);
                }

                setError("");

                const snapshot = await getHomeDataSnapshot();

                if (isCancelled) {
                    return;
                }

                setEvents(snapshot.events);
                setTotalPlayers(snapshot.totalPlayers);
            } catch (err) {
                if (isCancelled) {
                    return;
                }

                console.error(err);
                setError(t("home.loadError"));
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        loadHomeData();

        return () => {
            isCancelled = true;
        };
    }, []);

    const activeMatches = events.filter(
        (event) =>
            event.type === "match" &&
            event.status === "active" &&
            new Date(event.startDate) >= new Date()
    ).length;

    const upcomingEvents = events
        .filter(
            (event) =>
                event.status === "active" && new Date(event.startDate) >= new Date()
        )
        .sort(
            (left, right) =>
                new Date(left.startDate).getTime() -
                new Date(right.startDate).getTime()
        )
        .slice(0, 3);

    const openPlayCount = events.filter((event) => event.type === "open_play").length;

    return {
        totalPlayers,
        events,
        loading,
        error,
        totalEvents: events.length,
        activeMatches,
        upcomingEvents,
        openPlayCount,
    };
}
