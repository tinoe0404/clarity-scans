import React from "react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import { useTranslations } from "next-intl";

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

  if (!isVisible) return null;

  return (
    <div 
      role="dialog" 
      aria-label="Video complete"
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-slideUp border-t border-surface-border/50"
    >
      <div className="text-5xl mb-4 animate-bounce" style={{ animationIterationCount: 1 }}>✅</div>
      
      <h2 className="font-display text-2xl font-bold text-white mb-1">
        Great job!
      </h2>
      <p className="text-slate-300 mb-8 text-center px-4 line-clamp-2">
        You finished watching {moduleTitle}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-[280px]">
        <button
          onClick={onMarkWatched}
          className={cn(buttonStyles("primary", "lg"), "w-full shadow-glow bg-brand-500 text-white")}
        >
          {t("markWatched")}
        </button>
        
        <button
          onClick={onReplay}
          className={cn(buttonStyles("ghost", "md"), "w-full text-slate-300")}
        >
          {t("watchAgain")}
        </button>
      </div>
    </div>
  );
}
