"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { Locale } from "@/types";
import { AppShell } from "@/components/shared";
import BrandHeader from "./BrandHeader";
import LanguageButton from "./LanguageButton";
import { clearPatientSession, setSessionId } from "@/lib/session";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { handleClientError } from "@/lib/globalErrorHandler";

interface LanguagePickerScreenProps {
  suggestedLocale: Locale | null;
}

const LANGUAGES: Array<{ locale: Locale; nativeName: string; englishName: string; flag: string }> =
  [
    { locale: "en", nativeName: "English", englishName: "English", flag: "🇬🇧" },
    { locale: "sn", nativeName: "ChiShona", englishName: "Shona", flag: "🇿🇼" },
    { locale: "nd", nativeName: "isiNdebele", englishName: "Ndebele", flag: "🇿🇼" },
  ];

export default function LanguagePickerScreen({ suggestedLocale }: LanguagePickerScreenProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const [actualSuggested, setActualSuggested] = useState<Locale | null>(null);
  const { trackEvent } = useAnalytics();

  // Reset any previous patient's session whenever this picker mounts.
  useEffect(() => {
    clearPatientSession();

    // Check for "Last used" locale in the browser cookie
    const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
    if (match && match[1] && ["en", "sn", "nd"].includes(match[1] as string)) {
      setActualSuggested(match[1] as Locale);
    }
  }, []);

  const handleLanguageSelect = async (locale: Locale) => {
    if (selectedLocale) return; // Prevent double-taps

    setSelectedLocale(locale);

    try {
      // 1. Explicitly set the cookie so next-intl respects it immediately on redirect.
      await fetchWithTimeout("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });

      // 2. Generate an anonymous session from our database/backend
      // Note: As you mentioned /api/sessions path is Phase X existing. We assume it replies with { success: true, data: { id: string } }
      // If the `/api/sessions` backend endpoint doesn't strictly exist or isn't perfect, we can still fall back generating a UUID client-side for localStorage
      const sessionRes = await fetchWithTimeout("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: locale,
          deviceType:
            typeof window !== "undefined" && window.innerWidth >= 768 ? "tablet" : "phone",
        }),
      }).catch((e) => {
        handleClientError(e, "LanguagePickerScreen - Session API failed");
        return null;
      });

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
        trackEvent("language_selected", { locale });
      } catch (_e) {
        // Must never block execution
      }

      // 5. Navigate to patient education module index
      router.push(`/${locale}/modules`);
    } catch (error) {
      handleClientError(error, "LanguagePickerScreen - handleLanguageSelect");
      // Recover navigation state on extreme block
      setSelectedLocale(null);
    }
  };

  return (
    <AppShell locale={suggestedLocale || "en"} className="justify-between px-6 pb-8">
      <div className="flex flex-1 flex-col justify-center">
        <BrandHeader />

        <div className="mt-8 space-y-3">
          {searchParams?.get("reason") === "session_expired" && (
            <div 
              className="mb-6 rounded-lg bg-surface-elevated p-4 text-center border border-amber-500/20"
              role="alert" 
              aria-live="polite"
            >
              <p className="text-sm font-medium text-amber-200">
                Your session ended — please choose your language to continue.
              </p>
            </div>
          )}

          <p className="mb-4 text-center font-display text-sm font-semibold text-slate-400">
            Choose Your Language / Sarudza Mutauro / Khetha Ulimi
          </p>

          {LANGUAGES.map((lang, index) => (
            <LanguageButton
              key={lang.locale}
              {...lang}
              isSuggested={actualSuggested === lang.locale}
              isLoading={selectedLocale === lang.locale}
              isDisabled={selectedLocale !== null && selectedLocale !== lang.locale}
              onClick={handleLanguageSelect}
              animationDelay={800 + index * 100} // Stagger in after brand header finishes (approx 800ms mark)
            />
          ))}
        </div>
      </div>

      <div
        className="mt-12 flex animate-fadeIn flex-col items-center justify-end space-y-4"
        style={{ animationDelay: "1500ms" }}
      >
        {/* Visible Staff Login Link */}
        <Link
          href="/admin/login"
          className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 font-mono text-[11px] font-medium text-slate-500 transition-all hover:border-brand-500/20 hover:bg-brand-500/5 hover:text-slate-300"
        >
          <span aria-hidden="true">🔐</span>
          Staff Login
        </Link>

        <p className="font-mono text-[9px] text-slate-800">
          v0.1.0 — {new Date().getFullYear()} ClarityScans
        </p>
      </div>
    </AppShell>
  );
}
