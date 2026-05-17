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
  return (
    <AnalyticsPanel title={title} description={description}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-center">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={92}
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
                <span className="font-semibold text-slate-700">{entry.name}</span>
              </div>
              <span className="font-black text-slate-950">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsPanel>
  );
}
