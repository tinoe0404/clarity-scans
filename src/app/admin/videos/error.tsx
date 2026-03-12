"use client";

import AdminShell from "@/components/admin/AdminShell";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";

export default function VideosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AdminShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-medical-red/10">
          <AlertCircle className="h-10 w-10 text-medical-red" />
        </div>

        <h1 className="mb-2 font-display text-2xl font-bold text-white">Video Manager Error</h1>

        <p className="mb-2 max-w-sm text-slate-400">
          Something went wrong loading the video manager. Any uploads in progress may need to be
          re-uploaded.
        </p>

        {process.env.NODE_ENV === "development" && (
          <pre className="mb-6 max-w-lg overflow-auto rounded-lg bg-black/50 p-3 text-left text-xs text-red-300">
            {error.message}
          </pre>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className={cn(buttonStyles("primary", "lg"), "flex items-center gap-2")}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className={cn(buttonStyles("secondary", "lg"))}
          >
            Reload Page
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
