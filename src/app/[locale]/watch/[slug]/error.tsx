"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import { AppShell } from "@/components/shared";

export default function VideoPlayerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const rootSegment = pathname.split("/")[1];
  const locale = ["en", "sn", "nd"].includes(rootSegment) ? rootSegment : "en";

  return (
    <AppShell locale={locale as any} className="flex flex-col h-screen overflow-hidden">
      
      <div className="shrink-0 relative z-20">
        <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center p-6 text-center border-b border-surface-border">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-medical-amber/10 mb-4">
             <AlertCircle className="h-8 w-8 text-medical-amber" />
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-1">
            This video could not be loaded
          </h2>
          <p className="text-slate-400 text-sm max-w-[280px]">
            Please ask the radiographer for help
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full p-6 flex flex-col items-center justify-center gap-4 border-t border-white/[0.06] bg-surface-card shadow-[0_-8px_16px_rgba(0,0,0,0.5)] z-30">
        <button
          onClick={reset}
          className={cn(buttonStyles("primary", "lg"), "w-full max-w-[280px]")}
        >
          Try Again
        </button>
        
        <Link
          href={`/${locale}/modules`}
          className={cn(buttonStyles("secondary", "lg"), "w-full max-w-[280px]")}
        >
          Back to Modules
        </Link>
      </div>
      
      {/* Dev context hook silently dumping */}
      <p className="sr-only">{error.message}</p>
    </AppShell>
  );
}
