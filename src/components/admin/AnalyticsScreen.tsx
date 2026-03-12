"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Download, Printer, RefreshCw, ChevronDown, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import DateRangeSelector from "./DateRangeSelector";
import type { DateRangeOption } from "./DateRangeSelector";
import AnxietyReductionSummary from "./AnxietyReductionSummary";
import AnxietyDistributionChart from "./AnxietyDistributionChart";
import AnxietyReductionChart from "./AnxietyReductionChart";
import SessionsTrendChart from "./SessionsTrendChart";
import BooleanMetricsPanel from "./BooleanMetricsPanel";
import BreakdownPanel from "./BreakdownPanel";
import FeedbackTable from "./FeedbackTable";
import type { FeedbackSummary } from "@/lib/queries/feedback";

/* ── Types ──────────────────────────────────── */
interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const DATE_RANGE_LABELS: Record<DateRangeOption, string> = {
  week: "Last 7 Days",
  month: "Last 30 Days",
  all: "All Time",
};

/* ── Props ──────────────────────────────────── */
interface AnalyticsScreenProps {
  initialSummary: FeedbackSummary | null;
}

export default function AnalyticsScreen({ initialSummary }: AnalyticsScreenProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [dateRange, setDateRange] = useState<DateRangeOption>("month");
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(Date.now());
  const [freshness, setFreshness] = useState("Just now");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const hiddenSince = useRef<number | null>(null);

  /* ── Toast helpers ─────────────────────────── */
  const addToast = useCallback((message: string, type: ToastItem["type"]) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  /* ── Fetch summary ─────────────────────────── */
  const fetchSummary = useCallback(async (range: DateRangeOption) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/feedback/summary?dateRange=${range}`);
      const json = await res.json();
      if (json.success) {
        setSummary(json.data);
        setLastFetch(Date.now());
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const handleDateRangeChange = useCallback((range: DateRangeOption) => {
    setDateRange(range);
    fetchSummary(range);
  }, [fetchSummary]);

  /* ── Freshness timer ───────────────────────── */
  useEffect(() => {
    const timer = setInterval(() => {
      const mins = Math.floor((Date.now() - lastFetch) / 60000);
      if (mins < 1) setFreshness("Just now");
      else setFreshness(`${mins} minute${mins > 1 ? "s" : ""} ago`);
    }, 60000);
    return () => clearInterval(timer);
  }, [lastFetch]);

  /* ── Visibility change auto-refresh ────────── */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        hiddenSince.current = Date.now();
      } else if (hiddenSince.current) {
        const elapsed = Date.now() - hiddenSince.current;
        hiddenSince.current = null;
        if (elapsed > 5 * 60000) fetchSummary(dateRange);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [dateRange, fetchSummary]);

  /* ── CSV Export: Raw feedback ───────────────── */
  const exportFeedbackCsv = useCallback(async () => {
    setExportOpen(false);
    addToast("Preparing download...", "info");
    try {
      const res = await fetch(`/api/feedback?format=csv&pageSize=10000`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      a.download = `clarityscans-feedback-${dateRange}-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("Download ready", "success");
    } catch {
      addToast("Export failed — please try again", "error");
    }
  }, [dateRange, addToast]);

  /* ── CSV Export: Summary report ─────────────── */
  const exportSummaryCsv = useCallback(() => {
    setExportOpen(false);
    if (!summary) return;
    addToast("Preparing download...", "info");
    const rows = [
      ["Metric", "Value", "Period"],
      ["Average Anxiety Before", summary.avgAnxietyBefore.toFixed(2), DATE_RANGE_LABELS[dateRange]],
      ["Average Anxiety After", summary.avgAnxietyAfter.toFixed(2), DATE_RANGE_LABELS[dateRange]],
      ["Average Reduction", summary.avgAnxietyReduction.toFixed(2), DATE_RANGE_LABELS[dateRange]],
      ["App Helpful Rate", `${(summary.helpfulRate * 100).toFixed(1)}%`, DATE_RANGE_LABELS[dateRange]],
      ["Understood Procedure Rate", `${(summary.understoodRate * 100).toFixed(1)}%`, DATE_RANGE_LABELS[dateRange]],
      ["Total Feedback", String(summary.totalFeedback), DATE_RANGE_LABELS[dateRange]],
      ["Total Sessions", String(summary.totalSessions), DATE_RANGE_LABELS[dateRange]],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clarityscans-summary-${dateRange}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Download ready", "success");
  }, [summary, dateRange, addToast]);

  /* ── Freshness color ───────────────────────── */
  const mins = Math.floor((Date.now() - lastFetch) / 60000);
  const freshnessColor = mins >= 5 ? "text-medical-amber" : "text-slate-500";

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          nav, aside, .no-print, button, select, input { display: none !important; }
          .print-header { display: block !important; }
          .print-summary { break-inside: avoid; }
          body { background: white !important; color: black !important; }
          * { color: black !important; border-color: #ccc !important; }
        }
      `}</style>

      {/* Print-only header */}
      <div className="print-header hidden">
        <h1 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
          ClarityScans Analytics Report — {DATE_RANGE_LABELS[dateRange]}
        </h1>
        <p style={{ fontSize: 12, color: "#666" }}>
          Generated {new Date().toLocaleDateString("en-ZW", { timeZone: "Africa/Harare" })} — Harare Institute of Technology HIT 300
        </p>
        <hr style={{ margin: "12px 0" }} />
      </div>

      <div className="space-y-6">
        {/* Progress bar */}
        {loading && (
          <div className="fixed left-0 right-0 top-0 z-50 h-1">
            <div className="h-full animate-pulse bg-brand-500" />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Feedback Analytics</h1>
            <p className={cn("text-xs", freshnessColor)}>
              Data as of {freshness}
              <button
                onClick={() => fetchSummary(dateRange)}
                className="ml-2 inline-flex items-center gap-1 text-brand-400 hover:underline"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeSelector value={dateRange} onChange={handleDateRangeChange} />

            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className={cn(buttonStyles("secondary", "sm"), "flex items-center gap-1.5 text-xs no-print")}
              >
                <Download className="h-3.5 w-3.5" /> Export <ChevronDown className="h-3 w-3" />
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-surface-border bg-surface-elevated p-1 shadow-xl">
                  <button onClick={exportFeedbackCsv} className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5">
                    Export Feedback Data (CSV)
                  </button>
                  <button onClick={exportSummaryCsv} className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5">
                    Export Summary Report
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className={cn(buttonStyles("secondary", "sm"), "flex items-center gap-1.5 text-xs no-print")}
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>

        {/* Content */}
        {summary ? (
          <>
            <AnxietyReductionSummary summary={summary} dateRangeLabel={DATE_RANGE_LABELS[dateRange]} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AnxietyDistributionChart
                distributionBefore={summary.distributionBefore}
                distributionAfter={summary.distributionAfter}
                avgBefore={summary.avgAnxietyBefore}
                avgAfter={summary.avgAnxietyAfter}
              />
              <AnxietyReductionChart
                distributionBefore={summary.distributionBefore}
                distributionAfter={summary.distributionAfter}
              />
            </div>

            <SessionsTrendChart dailyCounts={summary.dailyCounts} />

            <BooleanMetricsPanel
              helpfulRate={summary.helpfulRate}
              understoodRate={summary.understoodRate}
              totalFeedback={summary.totalFeedback}
            />

            <BreakdownPanel languageDistribution={summary.languageDistribution} />

            <FeedbackTable dateRange={dateRange} />
          </>
        ) : (
          <div className="rounded-2xl border border-surface-border bg-surface-card p-12 text-center">
            <p className="text-slate-400">No analytics data available. Check your date range or wait for feedback to be submitted.</p>
          </div>
        )}

        {/* Toasts */}
        <div className="fixed bottom-28 right-4 z-50 flex flex-col gap-2 md:bottom-6 no-print">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl",
                toast.type === "success" && "bg-medical-green/90 text-white",
                toast.type === "error" && "bg-medical-red/90 text-white",
                toast.type === "info" && "bg-brand-500/90 text-white"
              )}
            >
              {toast.message}
              <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} className="ml-1 rounded p-0.5 hover:bg-black/10">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
