"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { HELPFUL_TARGET, UNDERSTOOD_TARGET } from "@/lib/constants";

interface BooleanMetricsPanelProps {
  helpfulRate: number; // 0–1
  understoodRate: number; // 0–1
  totalFeedback: number;
}

function DonutCard({
  label,
  rate,
  target,
  targetLabel,
  total,
}: {
  label: string;
  rate: number;
  target: number;
  targetLabel: string;
  total: number;
}) {
  const pct = Math.round(rate * 100);
  const yesCount = Math.round(rate * total);
  const noCount = total - yesCount;
  const meetsTarget = rate >= target;

  const data = [
    { name: "Yes", value: yesCount },
    { name: "No", value: Math.max(noCount, 0) },
  ];

  const isEmpty = total === 0;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
      <h3 className="mb-4 text-center text-sm font-medium text-slate-400">{label}</h3>
      {isEmpty ? (
        <div className="flex h-[160px] items-center justify-center text-sm text-slate-500">
          No feedback collected yet.
        </div>
      ) : (
        <>
          <div className="relative mx-auto h-[160px] w-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#334155" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`font-display text-2xl font-bold ${
                  meetsTarget ? "text-medical-green" : "text-medical-amber"
                }`}
              >
                {pct}%
              </span>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-slate-500">
            {yesCount} of {total} patients
          </p>
          <p className="mt-1 text-center text-[10px] text-slate-600">
            {targetLabel}:{" "}
            <span className={meetsTarget ? "text-medical-green" : "text-medical-amber"}>
              {meetsTarget ? "✓ Met" : `Below target (${Math.round(target * 100)}%)`}
            </span>
          </p>
        </>
      )}

      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th>Response</th><th>Count</th></tr></thead>
        <tbody>
          <tr><td>Yes</td><td>{yesCount}</td></tr>
          <tr><td>No</td><td>{noCount}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export default function BooleanMetricsPanel({
  helpfulRate,
  understoodRate,
  totalFeedback,
}: BooleanMetricsPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <DonutCard
        label="App Helpful"
        rate={helpfulRate}
        target={HELPFUL_TARGET}
        targetLabel="Target: above 80%"
        total={totalFeedback}
      />
      <DonutCard
        label="Understood Procedure"
        rate={understoodRate}
        target={UNDERSTOOD_TARGET}
        targetLabel="Target: above 70%"
        total={totalFeedback}
      />
    </div>
  );
}
