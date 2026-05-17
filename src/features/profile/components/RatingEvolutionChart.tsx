import { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceDot,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { DEFAULT_COMPETITIVE_RATING, formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import type { CompetitiveChartPoint } from "../types/profileCompetitiveInsights.types";

interface RatingEvolutionChartProps {
    points: CompetitiveChartPoint[];
    loading?: boolean;
}

function formatDeltaLabel(value: number) {
    return value > 0 ? `+${value}` : `${value}`;
}

export function RatingEvolutionChart({
    points,
    loading = false,
}: RatingEvolutionChartProps) {
    const chartData = useMemo(
        () =>
            points.map((point) => ({
                ...point,
                deltaLabel: formatDeltaLabel(point.ratingDelta),
            })),
        [points]
    );

    const latestPoint = chartData[chartData.length - 1] ?? null;
    const ratings = chartData.map((point) => point.rating);
    const minRating = ratings.length > 0 ? Math.min(...ratings) : DEFAULT_COMPETITIVE_RATING;
    const maxRating = ratings.length > 0 ? Math.max(...ratings) : DEFAULT_COMPETITIVE_RATING;
    const rangePadding = Math.max(12, Math.ceil((maxRating - minRating || 12) * 0.35));
    const yDomain: [number, number] = [
        Math.max(0, minRating - rangePadding),
        maxRating + rangePadding,
    ];

    if (loading) {
        return (
            <div className="rounded-[2rem] bg-white/70 p-6 text-sm text-slate-500 ring-1 ring-white/80">
                Loading rating evolution...
            </div>
        );
    }

    if (points.length === 0) {
        return (
            <div className="rounded-[2rem] bg-white/70 p-6 text-center ring-1 ring-white/80">
                <p className="font-bold text-slate-900">No competitive rating history yet</p>
                <p className="mt-2 text-sm text-slate-500">
                    Once you validate competitive matches, your rating graph will appear here.
                </p>
            </div>
        );
    }

    const minWidth = Math.max(340, chartData.length * 78);

    return (
        <div className="overflow-x-auto">
            <div
                className="rounded-[2rem] bg-gradient-to-b from-white to-blue-50/70 p-4 ring-1 ring-white/90 sm:p-5"
                style={{ minWidth }}
            >
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 18, right: 20, left: -14, bottom: 8 }}
                    >
                        <defs>
                            <linearGradient id="ratingAreaFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f7cff" stopOpacity={0.45} />
                                <stop offset="100%" stopColor="#4f7cff" stopOpacity={0.06} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            stroke="#dbeafe"
                            vertical={false}
                            strokeDasharray="4 8"
                        />

                        <XAxis
                            dataKey="label"
                            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            width={48}
                            domain={yDomain}
                        />

                        <Tooltip
                            cursor={{ stroke: "#93c5fd", strokeDasharray: "4 4" }}
                            content={({ active, payload }) => {
                                if (!active || !payload || payload.length === 0) {
                                    return null;
                                }

                                const point = payload[0].payload as CompetitiveChartPoint & {
                                    deltaLabel: string;
                                };

                                return (
                                    <div className="rounded-3xl border border-blue-100 bg-white px-4 py-3 shadow-xl">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                            {new Date(point.date).toLocaleDateString()}
                                        </p>
                                        <p className="mt-2 text-xl font-black text-slate-950">
                                            {formatCompetitiveRating(point.rating)} rating
                                        </p>
                                        <p
                                            className={`mt-1 text-sm font-bold ${
                                                point.ratingDelta >= 0
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {point.deltaLabel} after match
                                        </p>
                                    </div>
                                );
                            }}
                        />

                        <ReferenceLine
                            x={latestPoint?.label}
                            stroke="#93c5fd"
                            strokeDasharray="4 6"
                        />

                        <Area
                            type={chartData.length === 1 ? "linear" : "monotone"}
                            dataKey="rating"
                            stroke="#5b7cff"
                            strokeWidth={3}
                            fill="url(#ratingAreaFill)"
                            dot={{
                                r: 5,
                                strokeWidth: 0,
                                fill: "#6b8cff",
                            }}
                            activeDot={{
                                r: 7,
                                strokeWidth: 0,
                                fill: "#3b82f6",
                            }}
                        />

                        {latestPoint ? (
                            <ReferenceDot
                                x={latestPoint.label}
                                y={latestPoint.rating}
                                r={0}
                                ifOverflow="extendDomain"
                                label={{
                                    value: `${formatCompetitiveRating(latestPoint.rating)}`,
                                    position: "top",
                                    fill: "#0f172a",
                                    fontSize: 16,
                                    fontWeight: 900,
                                }}
                                shape={({ cx, cy }) => {
                                    const x = Number(cx ?? 0);
                                    const y = Number(cy ?? 0);

                                    return (
                                        <g>
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r={23}
                                                fill="#d9ff3f"
                                                fillOpacity={0.26}
                                            />
                                            <circle cx={x} cy={y} r={15} fill="#d9ff3f" />
                                            <circle cx={x} cy={y} r={5} fill="#1d4ed8" />
                                        </g>
                                    );
                                }}
                            />
                        ) : null}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
