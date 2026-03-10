"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import type { Locale } from "@/types";
import { AppShell } from "@/components/shared";
import BrandHeader from "./BrandHeader";
import LanguageButton from "./LanguageButton";
import { clearPatientSession, setSessionId } from "@/lib/session";
import { useHoldToNavigate } from "@/hooks/useHoldToNavigate";

interface LanguagePickerScreenProps {
  suggestedLocale: Locale | null;
}

const LANGUAGES: Array<{ locale: Locale; nativeName: string; englishName: string; flag: string }> = [
  { locale: "en", nativeName: "English", englishName: "English", flag: "🇬🇧" },
  { locale: "sn", nativeName: "ChiShona", englishName: "Shona", flag: "🇿🇼" },
  { locale: "nd", nativeName: "isiNdebele", englishName: "Ndebele", flag: "🇿🇼" },
];

export default function LanguagePickerScreen({ suggestedLocale }: LanguagePickerScreenProps) {
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  const { handlers: holdHandlers, progress, isHolding } = useHoldToNavigate("/admin/login", 3000);

  // Reset any previous patient's session whenever this picker mounts.
  useEffect(() => {
    clearPatientSession();
  }, []);

  const handleLanguageSelect = async (locale: Locale) => {
    if (selectedLocale) return; // Prevent double-taps
    
    setSelectedLocale(locale);

    try {
      // 1. Explicitly set the cookie so next-intl respects it immediately on redirect.
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });

      // 2. Generate an anonymous session from our database/backend
      // Note: As you mentioned /api/sessions path is Phase X existing. We assume it replies with { success: true, data: { id: string } }
      // If the `/api/sessions` backend endpoint doesn't strictly exist or isn't perfect, we can still fall back generating a UUID client-side for localStorage
      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: locale, deviceType: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'tablet' : 'phone' }),
      }).catch(() => null);

      let sessionId = crypto.randomUUID(); // Fallback
      if (sessionRes?.ok) {
        const body = await sessionRes.json();
        if (body.success && body.data?.id) {
          sessionId = body.data.id;
        }
      }

      // 3. Store ID locally
      setSessionId(sessionId);

      // 4. Analytics
      try {
        track("language_selected", { locale });
      } catch (e) {
        // Must never block execution
      }

      // 5. Navigate to patient education module index
      router.push(`/${locale}/modules`);
    } catch (error) {
      // Recover navigation state on extreme block
      setSelectedLocale(null);
    }
  };

  return (
    <AppShell locale={suggestedLocale || "en"} className="justify-between px-6 pb-8">
      <div className="flex-1 flex flex-col justify-center">
        <BrandHeader />

        <div className="mt-8 space-y-3">
          <p className="mb-4 text-center font-display text-sm font-semibold text-slate-400">
            Choose Your Language / Sarudza Mutauro / Khetha Ulimi
          </p>

          {LANGUAGES.map((lang, index) => (
            <LanguageButton
              key={lang.locale}
              {...lang}
              isSuggested={suggestedLocale === lang.locale}
              isLoading={selectedLocale === lang.locale}
              isDisabled={selectedLocale !== null && selectedLocale !== lang.locale}
              onClick={handleLanguageSelect}
              animationDelay={800 + index * 100} // Stagger in after brand header finishes (approx 800ms mark)
            />
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-end animate-fadeIn space-y-4" style={{ animationDelay: "1500ms" }}>
        
        {/* Discreet Radiographer Admin Block */}
        <div className="relative flex items-center justify-center">
          <button
            {...holdHandlers}
            className="group relative flex items-center gap-2 p-4 outline-none select-none touch-none"
            aria-label="Staff access area"
          >
            <span className="font-mono text-[11px] font-medium text-slate-700 transition-colors group-hover:text-slate-500 group-active:text-slate-500">
              Staff access
            </span>

            {/* Circular progress overlay representing the 3-second hold */}
            <div 
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-xl bg-white/5 opacity-0 transition-opacity duration-300",
                isHolding && "opacity-100"
              )}
            >
              <div 
                className="absolute left-0 h-1 bg-brand-500/50 rounded-full bottom-0 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </button>
          
          {/* Tooltip hint on immediate press */}
          {isHolding && progress < 100 && (
             <span className="absolute -top-8 px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-[10px] text-white shadow-xl whitespace-nowrap animate-slideUp pointer-events-none">
               Hold to access staff area
             </span>
          )}
        </div>

        <p className="font-mono text-[9px] text-slate-800">
          v0.1.0 — {new Date().getFullYear()} ClarityScans
        </p>
      </div>
    </AppShell>
  );
}
