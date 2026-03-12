"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { FeedbackSummary } from "@/lib/queries/feedback";

const EMOJI_SCALE = ["😌", "🙂", "😐", "😟", "😰"];

interface AnxietyReductionSummaryProps {
  summary: FeedbackSummary;
  dateRangeLabel: string;
}

export default function AnxietyReductionSummary({
  summary,
  dateRangeLabel,
}: AnxietyReductionSummaryProps) {
  const { avgAnxietyBefore, avgAnxietyAfter, avgAnxietyReduction, totalFeedback } = summary;
  const reductionPositive = avgAnxietyReduction > 0;
  const reductionZero = Math.abs(avgAnxietyReduction) < 0.05;

  const getEmoji = (score: number) => EMOJI_SCALE[Math.min(Math.max(Math.round(score) - 1, 0), 4)];

  if (totalFeedback === 0) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-8 text-center">
        <p className="text-slate-400">No feedback collected yet — patients can submit feedback after their scan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Three stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Before */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Avg Anxiety Before</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getEmoji(avgAnxietyBefore)}</span>
            <span className="font-display text-3xl font-bold text-white">
              {avgAnxietyBefore.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">/ 5</span>
          </div>
        </div>

        {/* After */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Avg Anxiety After</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getEmoji(avgAnxietyAfter)}</span>
            <span className="font-display text-3xl font-bold text-white">
              {avgAnxietyAfter.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">/ 5</span>
          </div>
        </div>

        {/* Reduction */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Avg Reduction</p>
          <div className="flex items-center gap-3">
            {reductionZero ? (
              <Minus className="h-7 w-7 text-medical-amber" />
            ) : reductionPositive ? (
              <TrendingDown className="h-7 w-7 text-medical-green" />
            ) : (
              <TrendingUp className="h-7 w-7 text-medical-red" />
            )}
            <span
              className={`font-display text-3xl font-bold ${
                reductionZero ? "text-medical-amber" : reductionPositive ? "text-medical-green" : "text-medical-red"
              }`}
            >
              {reductionPositive ? "−" : "+"}{Math.abs(avgAnxietyReduction).toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">points</span>
          </div>
        </div>
      </div>

      {/* Plain-language summary */}
      <div className="rounded-2xl border border-brand-500/10 bg-brand-500/5 px-6 py-4 print-summary">
        <p className="text-sm leading-relaxed text-slate-300">
          On average, patients who used ClarityScans reported a{" "}
          <strong className="text-white">{Math.abs(avgAnxietyReduction).toFixed(1)} point {reductionPositive ? "reduction" : "increase"}</strong>{" "}
          in anxiety on a 5-point scale.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Sample size: {totalFeedback} feedback submissions · Period: {dateRangeLabel} · Self-reported data
        </p>
      </div>

      {/* sr-only accessible table */}
      <table className="sr-only">
        <caption>Anxiety Reduction Summary</caption>
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Average Anxiety Before</td><td>{avgAnxietyBefore.toFixed(1)}</td></tr>
          <tr><td>Average Anxiety After</td><td>{avgAnxietyAfter.toFixed(1)}</td></tr>
          <tr><td>Average Reduction</td><td>{avgAnxietyReduction.toFixed(1)}</td></tr>
          <tr><td>Sample Size</td><td>{totalFeedback}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
