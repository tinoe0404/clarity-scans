"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import type { Locale } from "@/types";

interface PatientHeaderProps {
  locale: Locale;
  showBack?: boolean;
  onBack?: () => void;
  backHref?: string;
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  watchedCount?: number;
  totalCount?: number;
}

export default function PatientHeader({
  locale: _locale,
  showBack = false,
  onBack,
  backHref,
  title,
  subtitle,
  showProgress = false,
  watchedCount = 0,
  totalCount = 0,
}: PatientHeaderProps) {
  const progressPercent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  return (
    <header className="bg-gradient-to-b from-surface-elevated to-surface-card px-6 pb-6 pt-8">
      <div className="flex items-start gap-3">
        {showBack && (
          <>
            {onBack ? (
              <button
                onClick={onBack}
                className={cn(buttonStyles("ghost", "sm"), "-ml-2 p-2")}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : backHref ? (
              <Link
                href={backHref as Route}
                className={cn(buttonStyles("ghost", "sm"), "-ml-2 p-2")}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            ) : null}
          </>
        )}

        {(title || subtitle) && (
          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="flex items-center gap-2 truncate font-display text-xl font-bold leading-tight text-white">
                {title}
                {isAllDone && <span className="text-xl animate-pulse">✅</span>}
              </h1>
            )}
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>
        )}
      </div>

      {showProgress && totalCount > 0 && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-xs text-slate-500">
            {watchedCount} of {totalCount} complete
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isAllDone ? "bg-medical-green" : "bg-gradient-to-r from-brand-500 to-brand-400"
              )}
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
    </header>
  );
}
