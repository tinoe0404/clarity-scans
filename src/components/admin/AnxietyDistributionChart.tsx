"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from "recharts";

interface AnxietyDistributionChartProps {
  distributionBefore: Record<string, number>;
  distributionAfter: Record<string, number>;
  avgBefore: number;
  avgAfter: number;
}

const SCORE_LABELS = ["😌 Very Calm", "🙂 Calm", "😐 Neutral", "😟 Anxious", "😰 Very Anxious"];

export default function AnxietyDistributionChart({
  distributionBefore,
  distributionAfter,
  avgBefore,
  avgAfter,
}: AnxietyDistributionChartProps) {
  const data = [1, 2, 3, 4, 5].map((score) => ({
    score: SCORE_LABELS[score - 1],
    before: distributionBefore[String(score)] || 0,
    after: distributionAfter[String(score)] || 0,
  }));

  const hasData = data.some((d) => d.before > 0 || d.after > 0);

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
        <h3 className="mb-4 text-sm font-medium text-slate-400">Anxiety Score Distribution</h3>
        <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
          No feedback collected yet — patients can submit feedback after their scan.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
      <h3 className="mb-4 text-sm font-medium text-slate-400">Anxiety Score Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="score" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
          {/* Averages rendered as horizontal reference lines per spec */}
          <ReferenceLine y={avgBefore} stroke="#ef4444" strokeDasharray="3 3" />
          <ReferenceLine y={avgAfter} stroke="#22c55e" strokeDasharray="3 3" />
          <Bar dataKey="before" name="Before" fill="#ef4444" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
          <Bar dataKey="after" name="After" fill="#22c55e" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* sr-only accessible table */}
      <table className="sr-only">
        <caption>Anxiety Score Distribution — Before vs After</caption>
        <thead><tr><th>Score</th><th>Before Count</th><th>After Count</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.score}><td>{d.score}</td><td>{d.before}</td><td>{d.after}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
