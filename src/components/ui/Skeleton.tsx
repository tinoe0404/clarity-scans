import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/styles";

interface SkeletonProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-elevated", className)}
      aria-busy="true"
      aria-label="Loading content..."
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(cardStyles("default"), "space-y-4 p-4", className)}
      aria-busy="true"
      aria-label="Loading module..."
    >
      <div className="flex items-center space-x-4">
        <SkeletonBlock className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        <SkeletonBlock className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonVideoPlayer({ className }: SkeletonProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-3xl space-y-6", className)}
      aria-busy="true"
      aria-label="Loading video player..."
    >
      <SkeletonBlock className="aspect-video w-full rounded-2xl" />

      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-1/2" />
        <SkeletonBlock className="h-4 w-1/4" />
      </div>

      <div className="space-y-3 pt-6">
        <SkeletonBlock className="h-6 w-32" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>
    </div>
  );
}
