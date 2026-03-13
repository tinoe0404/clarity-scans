/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslations } from "next-intl";

import type { Locale, VideoRecord, VideoSlug } from "@/types";
import type { ModuleRegistryEntry } from "@/lib/moduleRegistry";
import { getNextUnwatchedSlug } from "@/lib/moduleRegistry";
import { getSessionId, isModuleWatched, addWatchedModule, getWatchedModules } from "@/lib/session";

import { AppShell } from "@/components/shared";
import { LazyWrapper } from "@/components/shared/LazyWrapper";
import VideoPlaceholder from "./VideoPlaceholder";
import KeyPointCard from "./KeyPointCard";
import BreathTrainerCTA from "./BreathTrainerCTA";
import VideoLanguageSwitcher from "./VideoLanguageSwitcher";
import VideoCompletionOverlay from "./VideoCompletionOverlay";
import { buttonStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { ChevronLeft } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

// Lazy Evaluation preventing hydration mismatch on heavily interactive Engine.
// Preloader maps Phase 10 spec demands perfectly maintaining aesthetic.
const DynamicVideoPlayer = dynamic(() => import("./VideoPlayer"), {
  ssr: false,
  loading: () => (
    <VideoPlaceholder
      slug={"what-is-ct" as VideoSlug} // Dummy cast, overridden by styles
      locale="en"
      icon=""
      accentColor="#000000"
      isReady={true}
    /> // Scenario 2 triggers Spinner implicitly on missing children!
  ),
});

interface VideoPlayerScreenProps {
  locale: Locale;
  slug: VideoSlug;
  videoRecord: VideoRecord | null;
  registryEntry: ModuleRegistryEntry;
  serverTitle: string;
  serverDescription: string;
  serverKeyPoints: string[];
}

export default function VideoPlayerScreen({
  locale,
  slug,
  videoRecord,
  registryEntry,
  serverTitle,
  serverDescription,
  serverKeyPoints,
}: VideoPlayerScreenProps) {
  const router = useRouter();
  const t = useTranslations();
  const toast = useToast();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  // State
  const [isWatched, setIsWatched] = useState(false);
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  const [activeLocale, setActiveLocale] = useState<Locale>(locale);
  const [alternateVideoUrl, setAlternateVideoUrl] = useState<string | null>(null);
  const [isFetchingAlternate, setIsFetchingAlternate] = useState(false);

  // Determine actual blob binding evaluating swappable state
  const activeBlobUrl = alternateVideoUrl || videoRecord?.blob_url || null;
  const isReady = !!activeBlobUrl;

  useEffect(() => {
    const sid = getSessionId();
    if (!sid) {
      router.push(`/${locale}`);
      return;
    }
    setSessionId(sid);
    setIsWatched(isModuleWatched(slug));
  }, [locale, router, slug]);

  const handleBack = () => {
    if (!isWatched) {
      toast.showToast("Don't forget to mark this as watched!", "info");
      setTimeout(() => router.push(`/${locale}/modules`), 1000);
    } else {
      router.push(`/${locale}/modules`);
    }
  };

  const handleLanguageSwitch = async (newLocale: Locale) => {
    setIsFetchingAlternate(true);
    try {
      const res = await fetch(`/api/videos/${slug}?locale=${newLocale}`);
      if (!res.ok) throw new Error("Not Found");
      const data = await res.json();
      if (data.success && data.data.is_active) {
        setAlternateVideoUrl(data.data.blob_url);
        setActiveLocale(newLocale);
      } else {
        toast.showToast(t("video.noVideo", { language: newLocale }), "error");
      }
    } catch {
      toast.showToast(t("video.noVideo", { language: newLocale }), "error");
    } finally {
      setIsFetchingAlternate(false);
    }
  };

  const handleMarkWatched = async () => {
    if (isWatched || isMarkingWatched || !sessionId) return;

    setIsMarkingWatched(true);

    // 1. Immediate sync into Storage (Source of Truth)
    addWatchedModule(slug);
    setIsWatched(true);
    setShowCompletionPrompt(true);

    try {
      // 2. Best-effort API Dispatch persisting
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedModules: getWatchedModules() }),
      });
      trackEvent("module_watched", { locale, slug });
    } catch {
      // Intentionally silences errors resolving cleanly off local Storage hooks
    } finally {
      setIsMarkingWatched(false);
      // Auto-jump logic handling implicitly after 2000 ms read window
      setTimeout(() => {
        const nextTarget = getNextUnwatchedSlug(getWatchedModules());
        if (nextTarget) {
          router.push(`/${locale}/watch/${nextTarget}`);
        } else {
          router.push(`/${locale}/modules`);
        }
      }, 2000);
    }
  };

  const handleReplay = () => {
    setShowCompletionPrompt(false);
    // Real HTML5 players will require external Ref triggers if forced here.
    // Given React declarative bounds, we visually pop the dialog and allow them to manually press Center Play.
  };

  const nextSlugTarget = getNextUnwatchedSlug([...getWatchedModules(), slug]);

  // Derived Title / Descriptions mapping straight to static locales supporting missing DB scenarios cleanly
  const title = serverTitle;
  const description = serverDescription;
  const keyPoints = serverKeyPoints;

  return (
    <AppShell locale={locale} className="flex h-screen flex-col overflow-hidden bg-surface-base">
      {/* Upper Media Block */}
      <div className="relative z-20 shrink-0">
        <div className="absolute left-4 top-4 z-40">
          <button
            onClick={handleBack}
            aria-label={t("nav.back")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform hover:scale-105"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          {isReady ? (
            <>
              <DynamicVideoPlayer
                blobUrl={activeBlobUrl as string}
                thumbnailUrl={videoRecord?.thumbnail_url || null}
                accentColor={registryEntry.accentColor}
                onVideoEnd={() => setShowCompletionPrompt(true)}
                onError={(err) => toast.showToast(err, "error")}
              />

              <VideoCompletionOverlay
                isVisible={showCompletionPrompt}
                onMarkWatched={handleMarkWatched}
                onReplay={handleReplay}
                moduleTitle={title}
              />
            </>
          ) : (
            <VideoPlaceholder
              slug={slug}
              locale={locale}
              accentColor={registryEntry.accentColor}
              icon={registryEntry.icon}
              isReady={false}
            />
          )}
        </div>

        <VideoLanguageSwitcher
          currentLocale={activeLocale}
          slug={slug}
          onSwitch={handleLanguageSwitch}
          isLoading={isFetchingAlternate}
        />
      </div>

      {/* Middle Scrollable Layout Block */}
      <div className="custom-scrollbar relative w-full flex-1 overflow-y-auto pb-24">
        {registryEntry.isImportant && (
          <div className="sticky top-0 z-10 break-words border-l-4 border-amber-500 bg-amber-500/10 px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-amber-500">
              ⚠️ Watch carefully — this is the most important step
            </p>
          </div>
        )}

        {/* Fallback Header Injection for un-synced DB records pushing immediate offline context */}
        {!isReady && (
          <div className="mx-6 mt-6 rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-4 text-sm text-brand-300">
            Read these key points while the video is being prepared
          </div>
        )}

        <div className="px-6 pb-2 pt-6">
          <h1 className="mb-2 font-display text-2xl font-bold leading-tight text-white">{title}</h1>
          <p className="mb-4 text-sm leading-relaxed text-slate-400">{description}</p>

          <LazyWrapper
            fallback={<div className="h-48 w-full animate-pulse rounded-2xl bg-surface-elevated" />}
            minHeight="192px"
            rootMargin="100px"
          >
            <KeyPointCard points={keyPoints} accentColor={registryEntry.accentColor} />
          </LazyWrapper>
        </div>

        {slug === "breathhold" && <BreathTrainerCTA locale={locale} />}
      </div>

      {/* Static Binding Footer Container */}
      <div className="absolute bottom-0 left-0 right-0 z-30 shrink-0 border-t border-white/[0.06] bg-surface-card px-6 py-4 pb-8 shadow-[0_-8px_16px_rgba(0,0,0,0.5)]">
        {isWatched ? (
          <div className="flex flex-col gap-3">
            <div className="mb-1 flex items-center justify-center gap-2 font-medium text-medical-green">
              <span className="text-lg">✅</span> {t("video.markWatched").replace("Mark", "")}
            </div>

            {nextSlugTarget ? (
              <Link
                href={`/${locale}/watch/${nextSlugTarget}` as Route}
                className={cn(buttonStyles("primary", "lg"), "w-full")}
              >
                {t("video.nextModule")} →
              </Link>
            ) : (
              <button
                onClick={() => router.push(`/${locale}/modules`)}
                className={cn(buttonStyles("secondary", "lg"), "w-full")}
              >
                {t("nav.back")} to Modules
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              disabled={isMarkingWatched}
              onClick={handleMarkWatched}
              className={cn(
                buttonStyles("primary", "lg"),
                "group flex w-full items-center justify-center gap-2 transition-all",
                isMarkingWatched && "opacity-80"
              )}
              style={{ backgroundColor: registryEntry.accentColor }}
            >
              {isMarkingWatched ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                t("video.markWatched")
              )}
            </button>

            <button
              disabled={isMarkingWatched}
              onClick={() => router.push(`/${locale}/modules`)}
              className={cn(buttonStyles("ghost", "md"), "w-full text-slate-400 hover:text-white")}
            >
              {t("nav.back")} to Modules
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
