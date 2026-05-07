import { getEvents } from "../../events/services/events.service";
import { supabase } from "../../../config/supabase";

async function getTotalUsers() {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  return count ?? 0;
}

async function getRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("event_id");

  if (error) throw error;

  return data;
}

export async function getStatsData() {
  const [events, registrations, totalUsers] = await Promise.all([
    getEvents(),
    getRegistrations(),
    getTotalUsers(),
  ]);

  const totalEvents = events.length;
  const activeEvents = events.filter((event) => event.status === "active").length;
  const totalMatches = events.filter((event) => event.type === "match").length;
  const totalTournaments = events.filter(
    (event) => event.type === "tournament"
  ).length;

  const totalRegistrations = registrations.length;

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

  return {
    totalEvents,
    activeEvents,
    totalMatches,
    totalTournaments,
    totalRegistrations,
    eventsByType,
    eventsByMonth,
    topLocations,
    totalUsers,
  };
}