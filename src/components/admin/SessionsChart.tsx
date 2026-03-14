"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { DateRangeOption } from "./DateRangeSelector";

interface DailyCount {
  date: string; // ISO string 2026-03-10
  count: number;
}

interface SessionsChartProps {
  data: DailyCount[];
  dateRange: DateRangeOption;
}

export default function SessionsChart({ data, dateRange }: SessionsChartProps) {
  // Format the dates for the X axis
  const chartData = useMemo(() => {
    return data.map((item) => {
      // We parse the string date and format to "10 Mar"
      let dateLabel = item.date;
      try {
        const d = new Date(item.date); // or parseISO depending on exact format
        if (!isNaN(d.getTime())) {
          dateLabel = format(d, "dd MMM");
        }
      } catch (_e) {
        // Fallback to raw
      }
      return {
        ...item,
        dateLabel,
      };
    });
  }, [data]);

  const isEmpty = data.length === 0 || data.every((d) => d.count === 0);

  // Recharts interval: 0 means show all, 1 means skip 1, etc.
  // "every 3rd label on week view" => skip 2 => interval={2}
  // "every 7th on month view" => skip 6 => interval={6}
  // If "all" view, let Recharts calculate or use a big interval.
  const getInterval = () => {
    if (dateRange === "week") return 2;
    if (dateRange === "month") return 6;
    return "preserveStartEnd"; 
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-elevated overflow-hidden h-full flex flex-col">
      <div className="border-b border-surface-border p-5">
        <h3 className="text-base font-semibold text-white">Daily Sessions</h3>
      </div>
      
      <div className="p-5 flex-1 w-full min-h-[300px] relative">
        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No sessions recorded in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickMargin={12}
                axisLine={false}
                tickLine={false}
                interval={getInterval()}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  backgroundColor: "#1e293b", // surface-elevated roughly
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
                itemStyle={{ color: "#38bdf8" }} // brand-400
                formatter={(value: number) => [value, "Sessions"]}
                labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
              />
              <Bar
                dataKey="count"
                fill="url(#brandGradient)"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
              <defs>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
