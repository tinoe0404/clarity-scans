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
  if (isReady) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-elevated">
        {children}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-[72px] w-[72px] animate-pulse items-center justify-center rounded-full bg-black/40 shadow-glow-sm backdrop-blur-sm">
            <span className="ml-1 text-3xl">▶</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
      }}
    >
      <span className="text-6xl" aria-hidden="true">
        {icon}
      </span>
      <p className="font-display text-sm font-medium text-slate-400">Video coming soon</p>
      <p className="text-xs text-slate-600">Ask the radiographer for assistance</p>
    </div>
  );
}
