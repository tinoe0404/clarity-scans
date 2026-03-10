import React from "react";
import type { VideoSlug, Locale } from "@/types";

interface VideoPlaceholderProps {
  slug: VideoSlug;
  accentColor: string;
  icon: string;
  locale: Locale;
  isReady: boolean;
  children?: React.ReactNode;
}

export default function VideoPlaceholder({
  slug: _slug,
  accentColor,
  icon,
  locale: _locale,
  isReady,
  children,
}: VideoPlaceholderProps) {
  // Scenario 1: Video engine loaded and playing/ready
  if (isReady && children) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {children}
      </div>
    );
  }

  // Scenario 2: Video exists in DB but player component is still hydrating/buffering
  if (isReady && !children) {
    return (
      <div
        className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden bg-surface-elevated"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
        }}
      >
        <div className="flex flex-col items-center justify-center animate-pulse">
           {/* Temporary inline spinner to avoid circular imports occasionally seen */}
           <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  // Scenario 3: Video does not exist at all (isReady === false)
  return (
    <div
      className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden bg-surface-elevated"
      style={{
        background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
      }}
    >
      <div className="absolute inset-0 ring-1 ring-inset ring-brand-500/20 animate-pulse-glow" />
      <span className="text-6xl mb-2" aria-hidden="true">
        {icon}
      </span>
      <p className="font-display text-base font-medium text-white">Video coming soon</p>
      <p className="text-sm text-slate-400">Ask the radiographer for assistance</p>
    </div>
  );
}
