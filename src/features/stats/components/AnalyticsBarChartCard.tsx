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

function formatChartLabel(label: string) {
  if (!label) {
    return "";
  }

  if (label.startsWith("Week of ")) {
    return label.replace("Week of ", "");
  }

  return label;
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
      <div className="h-56 w-full pr-2 sm:h-64 sm:pr-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ left: -8, right: 8, top: 12, bottom: 0 }}
            barCategoryGap="26%"
          >
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tickFormatter={formatChartLabel}
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              minTickGap={10}
              angle={0}
              textAnchor="middle"
              height={32}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={20}
            />
            <Tooltip
              labelFormatter={(value) => formatChartLabel(String(value))}
            />
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[10, 10, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsPanel>
  );
}
