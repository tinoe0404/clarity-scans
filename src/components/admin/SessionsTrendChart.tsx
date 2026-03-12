"use client";

import { useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

interface SessionsTrendChartProps {
  dailyCounts: { date: string; count: number }[];
}

export default function SessionsTrendChart({ dailyCounts }: SessionsTrendChartProps) {
  const chartData = useMemo(() => {
    if (dailyCounts.length === 0) return [];

    return dailyCounts.map((entry, idx) => {
      let rollingAvg: number | null = null;
      if (idx >= 6) {
        const window = dailyCounts.slice(idx - 6, idx + 1);
        rollingAvg = window.reduce((sum, d) => sum + d.count, 0) / 7;
      }
      return {
        date: entry.date,
        sessions: entry.count,
        avg7d: rollingAvg,
      };
    });
  }, [dailyCounts]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
        <h3 className="mb-4 text-sm font-medium text-slate-400">Sessions Trend</h3>
        <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
          No sessions recorded in this period.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
      <h3 className="mb-4 text-sm font-medium text-slate-400">Sessions Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="sessions" name="Daily Sessions" fill="#6366f1" fillOpacity={0.3} radius={[2, 2, 0, 0]} />
          <Line
            dataKey="avg7d"
            name="7-Day Average"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 2, fill: "#6366f1" }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <table className="sr-only">
        <caption>Sessions Trend — Daily Counts and 7-Day Rolling Average</caption>
        <thead><tr><th>Date</th><th>Sessions</th><th>7-Day Avg</th></tr></thead>
        <tbody>
          {chartData.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td><td>{d.sessions}</td><td>{d.avg7d?.toFixed(1) ?? "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
