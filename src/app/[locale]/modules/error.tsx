"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import { AppShell } from "@/components/shared";

export default function ModulesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  // Attempt to recover the locale gracefully since Error views lack Next 14 standard param binding reliably
  const rootSegment = pathname.split("/")[1];
  const locale = ["en", "sn", "nd"].includes(rootSegment) ? rootSegment : "en";

  return (
    <AppShell locale={locale as any} className="flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-medical-amber/10 mb-6">
        <AlertCircle className="h-10 w-10 text-medical-amber" />
      </div>

      <h1 className="font-display text-2xl font-bold text-white mb-2">
        Something went wrong
      </h1>
      
      <p className="text-slate-400 mb-8 max-w-[280px]">
        Please ask the radiographer for help
      </p>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={reset}
          className={cn(buttonStyles("primary", "lg"), "w-full")}
        >
          Try Again
        </button>
        
        <Link
          href={`/${locale}`}
          className={cn(buttonStyles("secondary", "lg"), "w-full")}
        >
          Go Home
        </Link>
      </div>
      
      {/* Dev context hook silently dumping */}
      <p className="sr-only">{error.message}</p>
    </AppShell>
  );
}
