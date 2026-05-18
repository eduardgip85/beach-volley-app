import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AnalyticsPanel } from "./AnalyticsPanel";
import type { AnalyticsRatioPoint } from "../types/stats.types";

const defaultColors = ["#2563eb", "#10b981", "#f59e0b", "#f43f5e", "#0f172a"];

interface AnalyticsPieChartCardProps {
  title: string;
  description?: string;
  data: AnalyticsRatioPoint[];
  colors?: string[];
}

export function AnalyticsPieChartCard({
  title,
  description,
  data,
  colors = defaultColors,
}: AnalyticsPieChartCardProps) {
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <AnalyticsPanel title={title} description={description}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-center">
        <div className="h-48 w-full pr-2 sm:h-64 sm:pr-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="38%"
                outerRadius="62%"
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Total
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">{totalValue}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {data.map((entry, index) => (
            <div
              key={entry.name}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-xs font-semibold text-slate-700 sm:text-sm">{entry.name}</span>
              </div>
              <span className="text-right font-black text-slate-950">
                {entry.value}
                <span className="ml-2 text-[10px] font-semibold text-slate-400 sm:text-xs">
                  {totalValue > 0 ? `${Math.round((entry.value / totalValue) * 100)}%` : "0%"}
                </span>
              </span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </AnalyticsPanel>
  );
}
