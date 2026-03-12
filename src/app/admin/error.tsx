"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { AdminShell } from "@/components/shared";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <AdminShell>
       <div className="flex flex-col h-full bg-surface-base items-center justify-center p-6 text-center">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-full mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Dashboard Error</h2>
          <p className="text-slate-400 max-w-md mb-8">
            We encountered a problem loading the dashboard data. Please try refreshing the view.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-2.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-6 py-2.5 bg-surface-elevated border border-surface-border hover:bg-white/[0.04] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
            >
              <RotateCcw className="h-4 w-4" />
              Force Refresh
            </button>
          </div>

          {isDev && error.message && (
             <div className="mt-12 text-left w-full max-w-2xl bg-black/40 border border-red-500/20 rounded-xl p-4 overflow-auto">
               <p className="font-mono text-xs text-red-400 mb-2 font-bold">DEVELOPMENT ERROR DETAIL:</p>
               <pre className="font-mono text-xs text-red-300/80 whitespace-pre-wrap">
                 {error.message}
                 {error.stack && `\n\n${error.stack}`}
               </pre>
             </div>
          )}
       </div>
    </AdminShell>
  );
}
