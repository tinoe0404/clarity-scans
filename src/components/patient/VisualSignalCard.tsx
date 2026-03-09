"use client";

import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface VisualSignalCardProps {
  emoji: string;
  label: string;
  color: string;
  isFullScreen?: boolean;
  onClick: () => void;
}

export default function VisualSignalCard({
  emoji,
  label,
  color,
  isFullScreen = false,
  onClick,
}: VisualSignalCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  // Lock body scroll when full screen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isFullScreen]);

  if (isFullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 transition-all duration-300"
        style={{ backgroundColor: `${color}15` }}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          onClick={onClick}
          className="absolute right-6 top-6 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
        <span className="text-[120px] leading-none" aria-hidden="true">
          {emoji}
        </span>
        <span className="font-display text-[32px] font-bold" style={{ color }}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-300",
        "bg-white/[0.03] hover:bg-white/[0.06]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
      )}
      style={{ borderColor: `${color}40` }}
    >
      <span className="shrink-0 text-[40px] leading-none" aria-hidden="true">
        {emoji}
      </span>
      <span className="font-display text-base font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
