import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsPanel } from "./AnalyticsPanel";
import type { AnalyticsTrendPoint, RatingDistributionBucket } from "../types/stats.types";

type ChartData = AnalyticsTrendPoint[] | RatingDistributionBucket[];

interface AnalyticsBarChartCardProps {
  title: string;
  description?: string;
  data: ChartData;
  dataKey?: string;
  color?: string;
}

export function AnalyticsBarChartCard({
  title,
  description,
  data,
  dataKey = "count",
  color = "#2563eb",
}: AnalyticsBarChartCardProps) {
  return (
    <AnalyticsPanel title={title} description={description}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -18, right: 8, top: 12 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={data.length > 5 ? -20 : 0}
              textAnchor={data.length > 5 ? "end" : "middle"}
              height={data.length > 5 ? 56 : 30}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsPanel>
  );
}
