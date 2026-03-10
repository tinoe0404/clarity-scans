"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface VisualSignalCardProps {
  emoji: string;
  label: string;
  color: string;
  isRecentlyUsed?: boolean;
  tabIndex?: number;
  onClick: () => void;
}

export default function VisualSignalCard({
  emoji,
  label,
  color,
  isRecentlyUsed = false,
  tabIndex = 0,
  onClick,
}: VisualSignalCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // The parent grid should handle Arrow navigation, but local activation ensures A11y
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div
      role="button"
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex cursor-pointer items-center min-h-[120px] gap-4 rounded-3xl border-2 p-5 transition-all duration-300 relative overflow-hidden",
        "bg-white/[0.03] hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-glow",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/50"
      )}
      style={{ borderColor: `${color}40` }}
      aria-label={label}
    >
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundImage: `linear-gradient(to bottom right, ${color}, transparent)` }}
      />
      
      {isRecentlyUsed && (
        <div className="absolute top-2 right-2 flex items-center justify-center p-1.5 rounded-full bg-surface-base/80 border border-white/10 shadow-sm" aria-label="Recently used">
           <Clock className="w-3.5 h-3.5 text-slate-400" />
        </div>
      )}

      <span className="shrink-0 text-[48px] leading-none drop-shadow-md" aria-hidden="true">
        {emoji}
      </span>
      <span className="font-display text-xl font-bold leading-tight" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
