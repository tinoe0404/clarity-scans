import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { badgeStyles } from "@/lib/styles";
import type { VideoSlug } from "@/types";

interface ModuleCardProps {
  slug: VideoSlug;
  title: string;
  description: string;
  icon: string;
  duration: string;
  isImportant?: boolean;
  isWatched?: boolean;
  href: string;
  accentColor?: string;
}

export default function ModuleCard({
  slug: _slug,
  title,
  description,
  icon,
  duration,
  isImportant = false,
  isWatched = false,
  isNextUp = false,
  href,
  accentColor = "#0ea5e9",
}: ModuleCardProps) {
  return (
    <Link
      href={href as Route}
      className={cn(
        "relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200 overflow-hidden",
        "border-surface-border bg-surface-card",
        "hover:border-brand-500/25 hover:bg-white/[0.06]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
        isWatched && "opacity-60"
      )}
      role="article"
      aria-label={`${title} — ${duration}`}
    >
      {/* Next Up Indicator (Pulsing Dot) */}
      {isNextUp && (
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-brand-400 rounded-r-md animate-pulse-glow" 
          aria-hidden="true"
        />
      )}

      {/* Icon block — dynamic accent color via inline style (exception: dynamic tinting) */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: `${accentColor}26` }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-white">{title}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={badgeStyles("duration")}>{duration}</span>
          {isImportant && (
            <span
              className={cn(
                badgeStyles("important"),
                "border-medical-amber/20 bg-medical-amber/10 text-medical-amber"
              )}
            >
              Important
            </span>
          )}
        </div>
      </div>

      {/* Status icon */}
      <span className="shrink-0 text-lg" aria-hidden="true">
        {isWatched ? "✅" : "▶️"}
      </span>
    </Link>
  );
}
