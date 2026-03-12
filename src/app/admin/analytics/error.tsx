"use client";

import AdminShell from "@/components/admin/AdminShell";
import { AlertCircle, RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleCsvExport = async () => {
    try {
      const res = await fetch("/api/feedback?format=csv&pageSize=10000");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clarityscans-feedback-fallback-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("CSV export also failed. Please try again later.");
    }
  };

  return (
    <AdminShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-medical-red/10">
          <AlertCircle className="h-10 w-10 text-medical-red" />
        </div>
        <h1 className="mb-2 font-display text-2xl font-bold text-white">
          Analytics Error
        </h1>
        <p className="mb-6 max-w-sm text-slate-400">
          The analytics data could not be loaded. You can still export raw feedback
          using the button below.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mb-6 max-w-lg overflow-auto rounded-lg bg-black/50 p-3 text-left text-xs text-red-300">
            {error.message}
          </pre>
        )}
        <div className="flex gap-3">
          <button onClick={reset} className={cn(buttonStyles("primary", "lg"), "flex items-center gap-2")}>
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <button onClick={handleCsvExport} className={cn(buttonStyles("secondary", "lg"), "flex items-center gap-2")}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
