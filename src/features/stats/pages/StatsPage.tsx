import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "../components/StatCard";
import { getStatsData } from "../services/stats.service";

type StatsData = Awaited<ReturnType<typeof getStatsData>>;

export function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const data = await getStatsData();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Could not load statistics");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading statistics...</p>;
  }

  if (error || !stats) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Statistics error</h1>
        <p className="mt-2 text-slate-500">{error}</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Statistics</h1>
        <p className="mt-2 text-slate-500">
          Global overview of beach volleyball activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <StatCard label="Total events" value={stats.totalEvents} />
        <StatCard label="Active events" value={stats.activeEvents} />
        <StatCard label="Matches" value={stats.totalMatches} />
        <StatCard label="Open Play" value={stats.totalOpenPlays} />
        <StatCard label="Tournaments" value={stats.totalTournaments} />
        <StatCard label="Registrations" value={stats.totalRegistrations} />
        <StatCard label="Users" value={stats.totalUsers} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Events by type</h2>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.eventsByType}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {stats.eventsByType.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        index === 0
                          ? "#10b981"
                          : index === 1
                            ? "#f59e0b"
                            : "#2563eb"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Events by month</h2>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.eventsByMonth}>
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Top locations</h2>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topLocations}>
                <XAxis dataKey="location" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#0f172a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
