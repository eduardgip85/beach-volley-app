import { getEvents } from "../../events/services/events.service";
import { getEventRegistrationsCount } from "../../registrations/services/registrations.service";
import { supabase } from "../../../config/supabase";

export async function getStatsData() {
    const events = await getEvents();

    const registrationCounts = await Promise.all(
        events.map(async (event) => ({
        eventId: event.id,
        count: await getEventRegistrationsCount(event.id),
        }))
    );

    const totalEvents = events.length;
    const activeEvents = events.filter((event) => event.status === "active").length;
    const totalMatches = events.filter((event) => event.type === "match").length;
    const totalTournaments = events.filter((event) => event.type === "tournament").length;

    const totalRegistrations = registrationCounts.reduce((total, item) => total + item.count,0);

    const eventsByType = [
        { name: "Matches", value: totalMatches },
        { name: "Tournaments", value: totalTournaments },
    ];

    const eventsByMonthMap = events.reduce<Record<string, number>>(
        (acc, event) => {
        const month = new Date(event.startDate).toLocaleString("en", {
            month: "short",
            year: "numeric",
        });

        acc[month] = (acc[month] || 0) + 1;
        return acc;
        },
        {}
    );

    const eventsByMonth = Object.entries(eventsByMonthMap).map(
        ([month, count]) => ({
        month,
        count,
        })
    );

    const topLocationsMap = events.reduce<Record<string, number>>(
        (acc, event) => {
        acc[event.locationName] = (acc[event.locationName] || 0) + 1;
        return acc;
        },
        {}
    );

    const topLocations = Object.entries(topLocationsMap)
        .map(([location, count]) => ({
        location,
        count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    async function getTotalUsers() {
        const { count, error } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        if (error) throw error;

        return count ?? 0;
    }

    return {
        totalEvents,
        activeEvents,
        totalMatches,
        totalTournaments,
        totalRegistrations,
        eventsByType,
        eventsByMonth,
        topLocations,
        totalUsers: await getTotalUsers(),
    };
}