"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { buttonStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

export default function FeedbackError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = (pathname?.split("/")[1] || "en") as Locale;

  useEffect(() => {
    console.error("Feedback form crash:", error);
  }, [error]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-base items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center bg-surface-elevated/50 border border-white/10 p-8 rounded-3xl text-center shadow-xl">
        
        <div className="h-16 w-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <AlertCircle className="h-8 w-8" />
        </div>
        
        <h2 className="text-xl font-display font-bold text-white mb-2">
          Unable to load feedback form
        </h2>
        
        <p className="text-slate-400 text-sm mb-8 px-2">
          Please reload or return to the main modules view.
        </p>
        
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => reset()}
            className={cn(buttonStyles("primary", "lg"), "w-full flex items-center justify-center gap-2 font-medium")}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          
          <Link
            href={`/${locale}/modules`}
            className={cn(buttonStyles("secondary", "lg"), "w-full flex items-center justify-center gap-2")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Modules
          </Link>
        </div>

      </div>
    </div>
  );
}
