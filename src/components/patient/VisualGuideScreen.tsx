/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Locale } from "@/types";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";

import { SIGNAL_REGISTRY, getSignalBySlug, type SignalSlug } from "@/lib/signalRegistry";
import { useWakeLock } from "@/hooks/useWakeLock";

import { AppShell, PatientHeader, TabNavigation } from "@/components/shared";
import VisualSignalCard from "./VisualSignalCard";
import FullScreenSignalOverlay from "./FullScreenSignalOverlay";
import RecentSignalChip from "./RecentSignalChip";
import VisualInstructionBanner from "./VisualInstructionBanner";
import PrintCTACard from "./PrintCTACard";

interface VisualGuideScreenProps {
  locale: Locale;
}

export default function VisualGuideScreen({ locale }: VisualGuideScreenProps) {
  const t = useTranslations();

  const [activeSignal, setActiveSignal] = useState<SignalSlug | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<SignalSlug[]>([]);
  const [fullscreenStartTime, setFullscreenStartTime] = useState<number | null>(null);

  // 1. Hardware API
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  // 2. Keyboard Navigation Arrays tracking Ref targets cleanly enabling Arrow flows
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    requestWakeLock();
    track("visual_guide_viewed", { locale });

    // Load session array
    try {
      const stored = sessionStorage.getItem("cs_recent_signals");
      if (stored) {
        setRecentlyUsed(JSON.parse(stored));
      }
    } catch {}

    return () => {
      releaseWakeLock();
    };
  }, [locale, requestWakeLock, releaseWakeLock]);

  const handleSignalSelect = useCallback(
    (slug: SignalSlug) => {
      setActiveSignal(slug);
      setIsFullScreen(true);
      setFullscreenStartTime(Date.now());

      try {
        track("signal_used", { locale, signal: slug });
        track("signal_fullscreen", { locale, signal: slug });

        setRecentlyUsed((prev) => {
          // Prepend, dedupe, clamp to 3 items matching UI width max safely
          const updated = [slug, ...prev.filter((s) => s !== slug)].slice(0, 3);
          sessionStorage.setItem("cs_recent_signals", JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.warn("Analytics/Session Error:", err);
      }
    },
    [locale]
  );

  const handleCloseOverlay = useCallback(() => {
    if (activeSignal && fullscreenStartTime) {
      const durationMs = Date.now() - fullscreenStartTime;
      try {
        track("signal_fullscreen_closed", { locale, signal: activeSignal, durationMs });
      } catch {}
    }

    setIsFullScreen(false);
    setFullscreenStartTime(null);

    // Return explicit physical focus targeting exactly restoring A11y
    if (activeSignal) {
      const index = SIGNAL_REGISTRY.findIndex((s) => s.slug === activeSignal);
      if (index >= 0 && cardRefs.current[index]) {
        // Tiny delay mapping matching CSS animation decay bounds guaranteeing Ref restoration
        setTimeout(() => {
          cardRefs.current[index]?.focus();
        }, 50);
      }
    }
  }, [activeSignal, fullscreenStartTime, locale]);

  // Handle explicit 2-Column grid Arrow navigational arrays Native to physical specs natively
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = cardRefs.current.findIndex((el) => el === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    const total = SIGNAL_REGISTRY.length;

    switch (e.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % total;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + total) % total;
        break;
      case "ArrowDown":
        // 2-column explicit wrap logic
        nextIndex = currentIndex + 2;
        if (nextIndex >= total) nextIndex = (currentIndex + 1) % total;
        break;
      case "ArrowUp":
        nextIndex = currentIndex - 2;
        if (nextIndex < 0) nextIndex = (currentIndex - 1 + total) % total;
        break;
      default:
        return;
    }

    e.preventDefault();
    cardRefs.current[nextIndex]?.focus();
  };

  const activeSignalData = activeSignal ? getSignalBySlug(activeSignal) : null;

  return (
    <AppShell locale={locale} className="flex h-screen flex-col overflow-hidden bg-surface-base">
      <PatientHeader
        locale={locale}
        title={(t as any).raw("visual.title")}
        subtitle={(t as any).raw("visual.subtitle")}
        showBack={true}
        backHref={`/${locale}/modules`}
        showProgress={false}
      />

      <TabNavigation locale={locale} activeTab="visual" />

      <div className="custom-scrollbar flex w-full flex-1 flex-col overflow-y-auto pt-4">
        <VisualInstructionBanner locale={locale} />

        <div
          className="grid grid-cols-2 gap-3 px-6 pb-4"
          role="group"
          aria-label={(t as any).raw("visual.title")}
          onKeyDown={handleGridKeyDown}
        >
          {SIGNAL_REGISTRY.map((signal, index) => (
            <div
              key={signal.slug}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
              className="animate-fadeIn"
            >
              <VisualSignalCard
                emoji={signal.emoji}
                label={(t as any).raw(`visual.signals.${signal.translationKey}` as string)}
                color={signal.color}
                isRecentlyUsed={recentlyUsed.includes(signal.slug)}
                tabIndex={0}
                onClick={() => handleSignalSelect(signal.slug)}
              />
            </div>
          ))}
        </div>

        {recentlyUsed.length > 0 && (
          <div className="mb-2 mt-2 border-t border-white/5 px-6 pb-4 pt-6">
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Recently Used
            </p>
            <div className="custom-scrollbar relative -mx-6 flex items-center gap-3 overflow-x-auto px-6 pb-4">
              {recentlyUsed.map((slug) => {
                const signal = getSignalBySlug(slug);
                if (!signal) return null;
                return (
                  <RecentSignalChip
                    key={slug}
                    signal={signal}
                    label={(t as any).raw(`visual.signals.${signal.translationKey}` as string)}
                    onClick={() => handleSignalSelect(slug)}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-6 mt-auto border-t border-white/5 px-6 pt-8">
          <PrintCTACard locale={locale} />
        </div>
      </div>

      {isFullScreen && activeSignalData && (
        <FullScreenSignalOverlay
          signal={activeSignalData}
          label={(t as any).raw(`visual.signals.${activeSignalData.translationKey}` as string)}
          onClose={handleCloseOverlay}
        />
      )}
    </AppShell>
  );
}
