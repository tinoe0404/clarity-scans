import React from "react";
import type { Locale, VideoSlug } from "@/types";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import { useTranslations } from "next-intl";

interface VideoLanguageSwitcherProps {
  currentLocale: Locale;
  slug: VideoSlug;
  onSwitch: (locale: Locale) => Promise<void>;
  isLoading: boolean;
}

export default function VideoLanguageSwitcher({
  currentLocale,
  onSwitch,
  isLoading,
}: VideoLanguageSwitcherProps) {
  const t = useTranslations("video");

  const locales: { code: Locale; flag: string; label: string }[] = [
    { code: "en", flag: "🇬🇧", label: "EN" },
    { code: "sn", flag: "🇿🇼", label: "SN" },
    { code: "nd", flag: "🇿🇼", label: "ND" },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-surface-card border-b border-surface-border">
      <p className="text-xs text-slate-400 mb-3">{t("languageSwitch")}</p>
      
      <div className="flex items-center gap-3">
        {locales.map(({ code, flag, label }) => {
          const isActive = currentLocale === code;
          
          return (
            <button
              key={code}
              onClick={() => {
                if (!isActive && !isLoading) {
                  onSwitch(code);
                }
              }}
              disabled={isActive || isLoading}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                isActive
                  ? "bg-brand-500/20 border-brand-500/40 text-brand-400"
                  : "bg-white/[0.04] border-white/[0.08] text-slate-500 hover:text-slate-300 hover:bg-white/[0.08]"
              )}
              aria-pressed={isActive}
            >
              {isActive && isLoading ? (
                <Spinner size="sm" className="text-brand-400" />
              ) : (
                <span aria-hidden="true" className="text-base">{flag}</span>
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
