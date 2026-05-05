import { useEffect, useState } from "react";
import { getEvents } from "../../events/services/events.service";
import type { Event } from "../../events/types/event.types";
import { getStatsData } from "../../stats/services/stats.service"

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

            const data = await getEvents();
            setEvents(data);

            const statsData = await getStatsData();

            setTotalPlayers(statsData.totalUsers ?? 0);

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

        (event) => new Date(event.startDate) >= new Date()        
        
    ).length;

    const upcomingEvents = events
        .filter((event) => new Date(event.startDate) >= new Date())
        .slice(0, 3);

    return {
        totalPlayers,
        events,
        loading,
        error,
        totalEvents: events.length,
        activeMatches,
        upcomingEvents,
    };
}