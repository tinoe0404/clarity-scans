"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import { useTranslations } from "next-intl";
import { useFocusManagement } from "@/hooks/useFocusManagement";

interface VideoCompletionOverlayProps {
  isVisible: boolean;
  onMarkWatched: () => void;
  onReplay: () => void;
  moduleTitle: string;
}

export default function VideoCompletionOverlay({
  isVisible,
  onMarkWatched,
  onReplay,
  moduleTitle,
}: VideoCompletionOverlayProps) {
  const t = useTranslations("video");
  const markWatchedRef = useRef<HTMLButtonElement>(null);
  const { moveFocusTo } = useFocusManagement();

  // Focus the primary button when overlay becomes visible
  useEffect(() => {
    if (isVisible) {
      moveFocusTo(markWatchedRef);
    }
  }, [isVisible, moveFocusTo]);

  // Trap focus within the dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      const focusable = e.currentTarget.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Video complete"
      aria-modal="true"
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-slideUp border-t border-surface-border/50"
      onKeyDown={handleKeyDown}
    >
      <div
        className="text-5xl mb-4 motion-reduce:animate-none animate-bounce"
        style={{ animationIterationCount: 1 }}
        role="img"
        aria-label="Completed"
      >
        ✅
      </div>

      <h2 className="font-display text-2xl font-bold text-white mb-1">
        Great job!
      </h2>
      <p className="text-slate-300 mb-8 text-center px-4 line-clamp-2">
        You finished watching {moduleTitle}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-[280px]">
        <button
          ref={markWatchedRef}
          onClick={onMarkWatched}
          className={cn(buttonStyles("primary", "lg"), "w-full shadow-glow bg-brand-500 text-white min-h-[44px]")}
        >
          {t("markWatched")}
        </button>

        <button
          onClick={onReplay}
          className={cn(buttonStyles("ghost", "md"), "w-full text-slate-300 min-h-[44px]")}
        >
          {t("watchAgain")}
        </button>
      </div>
    </div>
  );
}
