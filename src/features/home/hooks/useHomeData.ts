import { useEffect, useState } from "react";
import { getPublicEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { supabase } from "../../../config/supabase";

async function getTotalPlayers() {
    const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    if (error) throw error;

    return count ?? 0;
}

export function useHomeData() {
    const [events, setEvents] = useState<Event[]>([]);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadHomeData() {
        try {
            setLoading(true);
            setError("");

            const [data, players] = await Promise.all([
                getPublicEvents(),
                getTotalPlayers(),
            ]);
            setEvents(data);
            setTotalPlayers(players);

        } catch (err) {
            console.error(err);
            setError("Could not load home data");
        } finally {
            setLoading(false);
        }
        }

        loadHomeData();
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
