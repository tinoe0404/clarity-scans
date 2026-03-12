"use client";

import { FileText, Activity, RefreshCw, Globe, Download } from "lucide-react";
import DateRangeSelector, { DateRangeOption } from "./DateRangeSelector";
import StatCard from "./StatCard";
import { NotesSummary } from "@/lib/queries/radiographerNotes";
import { cn } from "@/lib/utils";

interface NotesSummaryPanelProps {
  summary: NotesSummary | null;
  isLoading: boolean;
  dateRange: DateRangeOption;
  onDateRangeChange: (range: DateRangeOption) => void;
}

export default function NotesSummaryPanel({ summary, isLoading, dateRange, onDateRangeChange }: NotesSummaryPanelProps) {
  let mostUsedStr = "N/A";
  if (summary && summary.languageDistribution) {
    const { en, sn, nd } = summary.languageDistribution;
    const max = Math.max(en, sn, nd);
    if (max > 0) {
      if (max === en) mostUsedStr = "English";
      else if (max === sn) mostUsedStr = "ChiShona";
      else if (max === nd) mostUsedStr = "isiNdebele";
    }
  }

  const exportSummary = () => {
    if (!summary) return;
    const headers = ["Metric", "Value"];
    const rows = [
      ["Date Range", dateRange],
      ["Total Notes", summary.totalNotes.toString()],
      ["Compliance Rate", `${(summary.breathholdComplianceRate * 100).toFixed(1)}% (Target: >80%)`],
      ["Repeat Rate", `${(summary.repeatScanRate * 100).toFixed(1)}% (Target: <20%)`],
      ["English Count", summary.languageDistribution.en.toString()],
      ["Shona Count", summary.languageDistribution.sn.toString()],
      ["Ndebele Count", summary.languageDistribution.nd.toString()],
    ];
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clarityscans-notes-summary-${dateRange}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const compRateRaw = summary?.breathholdComplianceRate ?? 0;
  const compRate = compRateRaw * 100;
  const repRateRaw = summary?.repeatScanRate ?? 0;
  const repRate = repRateRaw * 100;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DateRangeSelector value={dateRange} onChange={onDateRangeChange} />
        <button
          onClick={exportSummary}
          disabled={isLoading || !summary}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-surface-elevated border border-surface-border rounded-lg hover:bg-surface-elevated/80 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Summary
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="scale-95 origin-top-left sm:scale-100 sm:origin-center w-full min-w-0">
          <StatCard
            title="Total Notes"
            value={summary?.totalNotes ?? 0}
            icon={<FileText className="h-5 w-5" />}
            accentColor="bg-brand-500"
            isLoading={isLoading}
          />
        </div>
        
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-elevated p-4 transition-all hover:bg-surface-elevated/80 w-full min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-xl text-white shadow-lg bg-medical-green">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-400 line-clamp-1">Compliance Rate</h3>
            <div className="flex items-baseline gap-1.5">
              {isLoading ? (
                <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
              ) : (
                <span className={cn("text-2xl font-bold tracking-tight", compRate >= 80 ? "text-medical-green" : "text-amber-400")}>
                  {compRate.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">Target: &gt;80% compliance</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-elevated p-4 transition-all hover:bg-surface-elevated/80 w-full min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-xl text-white shadow-lg bg-red-500">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-400 line-clamp-1">Repeat Rate</h3>
            <div className="flex items-baseline gap-1.5">
              {isLoading ? (
                <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
              ) : (
                <span className={cn("text-2xl font-bold tracking-tight", repRate <= 20 ? "text-medical-green" : "text-amber-400")}>
                  {repRate.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">Target: &lt;20% repeat rate</p>
          </div>
        </div>

        <div className="scale-95 origin-top-left sm:scale-100 sm:origin-center w-full min-w-0">
          <StatCard
            title="Most Used Lang"
            value={mostUsedStr}
            icon={<Globe className="h-5 w-5" />}
            accentColor="bg-blue-500"
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
