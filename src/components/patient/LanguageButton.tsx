"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";
import { ChevronRight } from "lucide-react";

interface LanguageButtonProps {
  locale: Locale;
  nativeName: string;
  englishName: string;
  flag: string;
  isSuggested?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick: (locale: Locale) => void;
  animationDelay?: number;
}

export default function LanguageButton({
  locale,
  nativeName,
  englishName,
  flag,
  isSuggested = false,
  isLoading = false,
  isDisabled = false,
  onClick,
  animationDelay = 0,
}: LanguageButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled || isLoading) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(locale);
    }
  };

  return (
    <div
      role="button"
      tabIndex={isDisabled || isLoading ? -1 : 0}
      aria-label={`${nativeName} — ${englishName}`}
      aria-disabled={isDisabled || isLoading}
      onClick={() => {
        if (!isDisabled && !isLoading) onClick(locale);
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-6 py-5 transition-all duration-300",
        "bg-white/[0.04] border-white/[0.08]",
        !isDisabled && !isLoading && "hover:bg-brand-500/10 hover:border-brand-500/30 hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
        isDisabled && "opacity-40 pointer-events-none",
        "opacity-0 transform translate-y-4 animate-slideUp"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <span className="shrink-0 text-[36px] leading-none" aria-hidden="true">
        {flag}
      </span>
      
      <div className="flex flex-1 flex-col truncate">
        <span className="truncate font-display text-xl font-bold text-white">
          {nativeName}
        </span>
        <span className="mt-0.5 truncate text-sm text-slate-500">
          {englishName}
        </span>
      </div>

      {isSuggested && (
        <span className="absolute right-4 top-3 rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-400">
          Last used
        </span>
      )}

      <div className="shrink-0 pl-2">
        {isLoading ? (
          <svg className="h-6 w-6 animate-spin text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <ChevronRight className="h-6 w-6 text-slate-400" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
