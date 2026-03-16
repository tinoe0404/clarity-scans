"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAnalytics } from "@/hooks/useAnalytics";

import type { Locale, VideoSlug } from "@/types";
import type { MergedModule } from "@/lib/moduleRegistry";
import { AppShell } from "@/components/shared";
import { LazyWrapper } from "@/components/shared/LazyWrapper";
import { SkeletonCard } from "@/components/ui/Skeleton";
import PatientHeader from "@/components/patient/PatientHeader";
import TabNavigation from "@/components/patient/TabNavigation";
import ModuleCard from "@/components/patient/ModuleCard";
import NoVideosNotice from "./NoVideosNotice";
import AllDoneCard from "./AllDoneCard";

import { getWatchedModules, getSessionId } from "@/lib/session";
import { useSessionSync } from "@/hooks/useSessionSync";
import { useFocusManagement } from "@/hooks/useFocusManagement";
import {
  getNextUnwatchedSlug,
} from "@/lib/moduleRegistry";
import { formatDuration } from "@/lib/utils";

interface ModulesScreenProps {
  locale: Locale;
  mergedModules: MergedModule[];
}

export default function ModulesScreen({ locale, mergedModules }: ModulesScreenProps) {
  const router = useRouter();
  const t = useTranslations("modules");
  const { trackEvent } = useAnalytics();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const { moveFocusTo } = useFocusManagement();

  const [watchedModules, setWatchedModules] = useState<VideoSlug[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync to database
  useSessionSync(sessionId, watchedModules);

  // 1. Initial Mount: Verify Session & Hydrate Watched State
  useEffect(() => {
    const currentSession = getSessionId();
    if (!currentSession) {
      // Redirect to absolute root to ensure a clean session start if missing
      router.push("/");
      return;
    }

    setSessionId(currentSession);
    
    const stored = getWatchedModules();
    setWatchedModules(stored);
    setIsLoaded(true);

    moveFocusTo(headingRef);

    try {
      trackEvent("modules_screen_viewed", { locale, sessionId: currentSession });
      if (stored.length === 5) {
        trackEvent("all_modules_completed", { locale });
      }
    } catch {}

    // Restore mapped scroll position for this specific view
    const savedScroll = sessionStorage.getItem("cs_scroll_modules");
    if (savedScroll && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [locale, router, moveFocusTo, trackEvent]);

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
  const hasAnyActiveVideos = mergedModules.some((m) => m.hasVideo);
  const nextUpSlug = getNextUnwatchedSlug(watchedModules);
  const isAllDone = isLoaded && watchedModules.length === 5;

  return (
    <AppShell locale={locale} className="flex flex-col h-screen overflow-hidden">
      {/* Fixed Upper Header Zone */}
      <div className="shrink-0 flex flex-col z-20 shadow-sm relative w-full" ref={headingRef}>
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
            mergedModules.map((mod, index) => (
              <LazyWrapper
                key={mod.slug}
                isAboveFold={index < 2}
                fallback={<SkeletonCard />}
                minHeight="104px"
              >
                <ModuleCard
                  slug={mod.slug}
                  title={mod.title || ""} 
                  description={mod.description || ""}
                  icon={mod.icon}
                  duration={formatDuration(mod.durationSeconds)}
                  accentColor={mod.accentColor}
                  isImportant={mod.isImportant}
                  isWatched={watchedModules.includes(mod.slug)}
                  isNextUp={mod.slug === nextUpSlug}
                  href={`/${locale}/watch/${mod.slug}`}
                />
              </LazyWrapper>
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
