"use client";

import type { Locale } from "@/types";
import { SUPPORTED_LOCALES } from "@/lib/constants";

const LOCALE_LABELS: Record<Locale, string> = { en: "English", sn: "ChiShona", nd: "isiNdebele" };
const LOCALE_COLORS: Record<Locale, string> = { en: "#6366f1", sn: "#f59e0b", nd: "#22c55e" };

interface BreakdownPanelProps {
  languageDistribution: Record<Locale, number>;
}

export default function BreakdownPanel({ languageDistribution }: BreakdownPanelProps) {
  const total = Object.values(languageDistribution).reduce((s, v) => s + v, 0);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
        <h3 className="mb-4 text-sm font-medium text-slate-400">Language Distribution</h3>
        <div className="flex h-[120px] items-center justify-center text-sm text-slate-500">
          No sessions recorded in this period.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
      <h3 className="mb-4 text-sm font-medium text-slate-400">Language Distribution</h3>

      {/* Stacked bar */}
      <div className="mb-4 flex h-6 overflow-hidden rounded-full bg-white/5">
        {SUPPORTED_LOCALES.map((loc) => {
          const count = languageDistribution[loc] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={loc}
              className="flex items-center justify-center text-[9px] font-bold text-white transition-all"
              style={{ width: `${pct}%`, backgroundColor: LOCALE_COLORS[loc] }}
            >
              {pct >= 10 ? `${Math.round(pct)}%` : ""}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {SUPPORTED_LOCALES.map((loc) => {
          const count = languageDistribution[loc] || 0;
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={loc} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: LOCALE_COLORS[loc] }} />
                <span className="text-slate-300">{LOCALE_LABELS[loc]}</span>
              </div>
              <span className="text-slate-500">{count} ({pct}%)</span>
            </div>
          );
        })}
      </div>

      <table className="sr-only">
        <caption>Language Distribution</caption>
        <thead><tr><th>Language</th><th>Count</th><th>Percentage</th></tr></thead>
        <tbody>
          {SUPPORTED_LOCALES.map((loc) => {
            const count = languageDistribution[loc] || 0;
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
            return <tr key={loc}><td>{LOCALE_LABELS[loc]}</td><td>{count}</td><td>{pct}%</td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
