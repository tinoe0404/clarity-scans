/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <AppShell locale={locale as any} className="flex h-screen flex-col overflow-hidden">
      <div className="relative z-20 shrink-0">
        <div className="relative flex aspect-video w-full flex-col items-center justify-center border-b border-surface-border bg-black p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-medical-amber/10">
            <AlertCircle className="h-8 w-8 text-medical-amber" />
          </div>
          <h2 className="mb-1 font-display text-xl font-bold text-white">
            This video could not be loaded
          </h2>
          <p className="max-w-[280px] text-sm text-slate-400">
            Please ask the radiographer for help
          </p>
        </div>
      </div>

      <div className="z-30 flex w-full flex-1 flex-col items-center justify-center gap-4 overflow-y-auto border-t border-white/[0.06] bg-surface-card p-6 shadow-[0_-8px_16px_rgba(0,0,0,0.5)]">
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
