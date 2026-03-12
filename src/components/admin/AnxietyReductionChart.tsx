"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface AnxietyReductionChartProps {
  distributionBefore: Record<string, number>;
  distributionAfter: Record<string, number>;
}

export default function AnxietyReductionChart({
  distributionBefore,
  distributionAfter,
}: AnxietyReductionChartProps) {
  // Compute reduction distribution from before/after distributions
  // This is a simplified approach — ideally each paired record would be used
  // For now, derive from the aggregate distributions
  const data = useMemo(() => {
    const reductionCounts: Record<number, number> = {};
    for (let r = -4; r <= 4; r++) reductionCounts[r] = 0;

    // Estimate: for each before score b and after score a, contribute min(before[b], after[a]) to reduction = b-a
    // This is an approximation from aggregate data
    const beforeTotal = Object.values(distributionBefore).reduce((s, v) => s + v, 0);
    const afterTotal = Object.values(distributionAfter).reduce((s, v) => s + v, 0);

    if (beforeTotal === 0 || afterTotal === 0) {
      return []; // No data
    }

    for (let b = 1; b <= 5; b++) {
      for (let a = 1; a <= 5; a++) {
        const reduction = b - a;
        const pBefore = (distributionBefore[String(b)] || 0) / beforeTotal;
        const pAfter = (distributionAfter[String(a)] || 0) / afterTotal;
        reductionCounts[reduction] += pBefore * pAfter * beforeTotal;
      }
    }

    return Array.from({ length: 9 }, (_, i) => {
      const val = i - 4;
      return {
        reduction: val > 0 ? `+${val}` : String(val),
        value: val,
        count: Math.round(reductionCounts[val] || 0),
      };
    });
  }, [distributionBefore, distributionAfter]);

  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
        <h3 className="mb-4 text-sm font-medium text-slate-400">Anxiety Reduction Distribution</h3>
        <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
          No feedback collected yet — patients can submit feedback after their scan.
        </div>
      </div>
    );
  }

  const getColor = (val: number) => {
    if (val > 0) return "#22c55e";
    if (val === 0) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
      <h3 className="mb-4 text-sm font-medium text-slate-400">Anxiety Reduction Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="reduction" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(val: number) => [val, "Patients"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.reduction} fill={getColor(entry.value)} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-xs text-slate-500">
        Positive values indicate anxiety decreased after using the app. Negative values indicate anxiety increased.
      </p>

      <table className="sr-only">
        <caption>Anxiety Reduction Distribution</caption>
        <thead><tr><th>Reduction</th><th>Count</th></tr></thead>
        <tbody>
          {data.map((d) => <tr key={d.reduction}><td>{d.reduction}</td><td>{d.count}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
