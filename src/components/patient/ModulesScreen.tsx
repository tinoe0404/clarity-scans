"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";

import type { Locale, VideoRecord, VideoSlug } from "@/types";
import { AppShell } from "@/components/shared";
import { SkeletonCard } from "@/components/ui/Skeleton";
import PatientHeader from "@/components/patient/PatientHeader";
import TabNavigation from "@/components/patient/TabNavigation";
import ModuleCard from "@/components/patient/ModuleCard";
import NoVideosNotice from "./NoVideosNotice";
import AllDoneCard from "./AllDoneCard";

import { getWatchedModules, getSessionId } from "@/lib/session";
import { useSessionSync } from "@/hooks/useSessionSync";
import {
  MODULE_REGISTRY,
  mergeModuleData,
  getNextUnwatchedSlug,
} from "@/lib/moduleRegistry";
import { formatDuration } from "@/lib/utils";

interface ModulesScreenProps {
  locale: Locale;
  dbVideos: VideoRecord[];
}

export default function ModulesScreen({ locale, dbVideos }: ModulesScreenProps) {
  const router = useRouter();
  const t = useTranslations("modules");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const [watchedModules, setWatchedModules] = useState<VideoSlug[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync to database
  useSessionSync(sessionId, watchedModules);

  // 1. Initial Mount: Verify Session & Hydrate Watched State
  useEffect(() => {
    const currentSession = getSessionId();
    if (!currentSession) {
      router.push(`/${locale}`);
      return;
    }

    setSessionId(currentSession);
    
    const stored = getWatchedModules();
    setWatchedModules(stored);
    setIsLoaded(true);

    try {
      track("modules_screen_viewed", { locale, sessionId: currentSession });
      if (stored.length === 5) {
        track("all_modules_completed", { locale });
      }
    } catch {}

    // Restore mapped scroll position for this specific view
    const savedScroll = sessionStorage.getItem("cs_scroll_modules");
    if (savedScroll && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [locale, router]);

  // 2. Refresh watched state organically upon returning to the PWA tab externally
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setWatchedModules(getWatchedModules());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // 3. Save scroll position intuitively upon tearing down / leaving the route
  const handleScroll = () => {
    if (scrollRef.current) {
      sessionStorage.setItem("cs_scroll_modules", scrollRef.current.scrollTop.toString());
    }
  };

  // 4. Data Derivation
  const mergedModules = mergeModuleData(MODULE_REGISTRY, dbVideos, locale);
  const hasAnyActiveVideos = mergedModules.some((m) => m.hasVideo);
  const nextUpSlug = getNextUnwatchedSlug(watchedModules);
  const isAllDone = isLoaded && watchedModules.length === 5;

  return (
    <AppShell locale={locale} className="flex flex-col h-screen overflow-hidden">
      {/* Fixed Upper Header Zone */}
      <div className="shrink-0 flex flex-col z-20 shadow-sm relative w-full">
        <PatientHeader
          locale={locale}
          title={isAllDone ? t("allDone") : t("title")}
          subtitle={isAllDone ? t("allDoneSubtitle") : t("subtitle")}
          showProgress={true}
          watchedCount={isLoaded ? watchedModules.length : 0}
          totalCount={5}
          isAllDone={isAllDone}
        />
        
        {/* Sticky Tab Barrier attached seamlessly below header shadow */}
        <div className="bg-gradient-to-b from-surface-elevated to-surface-card pt-0 pb-2 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
          <TabNavigation locale={locale} activeTab="modules" />
        </div>
      </div>

      {/* Primary Scrollable Content Body */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto w-full pb-12 pt-6 custom-scrollbar"
      >
        {isLoaded && isAllDone && (
          <AllDoneCard locale={locale} />
        )}

        <div className="space-y-3 px-6 pb-6">
          {!isLoaded ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            mergedModules.map((mod) => (
              <ModuleCard
                key={mod.slug}
                slug={mod.slug}
                // Pull directly from messages tree preventing null evaluations 
                // DB strings override fallback technically, but we enforce TS defaults here
                title={mod.title || t(`slugs.${mod.slug}.title`)} 
                description={mod.description || t(`slugs.${mod.slug}.description`)}
                icon={mod.icon}
                duration={formatDuration(mod.durationSeconds)}
                accentColor={mod.accentColor}
                isImportant={mod.isImportant}
                isWatched={watchedModules.includes(mod.slug)}
                isNextUp={mod.slug === nextUpSlug}
                href={`/${locale}/watch/${mod.slug}`}
              />
            ))
          )}
        </div>

        {isLoaded && !hasAnyActiveVideos && (
          <NoVideosNotice />
        )}
      </div>
    </AppShell>
  );
}
