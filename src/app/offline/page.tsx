"use client";

import Icon from "@/components/ui/Icon";
import { buttonStyles, screenContainerStyles } from "@/lib/styles";

export default function OfflinePage() {
  return (
    <main className={screenContainerStyles()}>
      <div className="flex h-full min-h-[60vh] flex-1 flex-col items-center justify-center space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-500">
            ClarityScans
          </h1>
        </div>

        <div className="w-full max-w-sm space-y-6 rounded-3xl border border-surface-border bg-surface-card p-8 shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-elevated text-gray-500">
            <Icon name="WifiOff" size="xl" />
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-white">You are offline</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              We couldn&apos;t connect to the network. Don&apos;t worry, portions of the app may
              still be available offline.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className={buttonStyles("primary", "lg")}
          >
            <Icon name="RotateCcw" size="sm" className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}
