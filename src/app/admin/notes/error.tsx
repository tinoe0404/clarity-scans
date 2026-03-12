"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { buttonStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";

export default function NotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Notes feature error:", error);
  }, [error]);

  return (
    <AdminShell title="Radiographer Notes" description="Log and review structured clinical observations immediately after patient CT scans.">
      <div className="flex flex-col items-center justify-center p-12 bg-surface-elevated rounded-2xl border border-surface-border text-center max-w-2xl mx-auto mt-8">
        <div className="w-16 h-16 rounded-full bg-medical-red/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-medical-red" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          We encountered an error loading the radiographer notes. 
          <span className="block mt-2 font-medium text-amber-500">Please note that any unsaved form data has been lost.</span>
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            onClick={() => reset()}
            className={cn(buttonStyles("primary", "md"), "flex items-center gap-2")}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
        
        <div className="pt-6 border-t border-surface-border w-full flex justify-center gap-6">
          <Link href="/admin/analytics" className="text-sm font-medium text-brand-400 hover:text-brand-300 hover:underline transition-colors">
            Go to Analytics
          </Link>
          <Link href="/admin" className="text-sm font-medium text-slate-400 hover:text-white hover:underline transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
