"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";
import { LOCALES } from "@/types";

export default function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    // Replace the locale part of the pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  const getFlag = (locale: Locale) => {
    switch (locale) {
      case "en": return "🇬🇧";
      case "sn": return "🇿🇼";
      case "nd": return "🇿🇼";
      default: return "🌐";
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1 border border-white/[0.08]">
      {LOCALES.map((locale) => {
        const isActive = currentLocale === locale;
        return (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold transition-all",
              isActive 
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" 
                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
            )}
            aria-label={`Switch to ${locale.toUpperCase()}`}
            aria-pressed={isActive}
          >
            <span className="sr-only">{locale.toUpperCase()}</span>
            <span aria-hidden="true" className="text-sm">{getFlag(locale)}</span>
          </button>
        );
      })}
    </div>
  );
}
