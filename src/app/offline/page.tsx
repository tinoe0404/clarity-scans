"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, CheckCircle2, Video, MessageSquare, CloudOff } from "lucide-react";
import Link from "next/link";
import { clearAppCache } from "@/lib/cacheStorage"; // We'll implement this later

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    // Read NEXT_LOCALE cookie to get current language
    const match = document.cookie.match(/(?:^|;)\s*NEXT_LOCALE=([^;]*)/);
    if (match && match[1]) {
      setLocale(match[1]);
    }
  }, []);

  const handleReconnect = async () => {
    setChecking(true);
    // Give a small delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Only attempt to clear caches if explicitly trying to reconnect 
    // and network is thought to be back, just in case cache is stuck.
    // if (navigator.onLine) {
    //   await clearAppCache();
    // }

    window.location.reload();
  };

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen flex-col items-center justify-center bg-surface-base p-6 text-white outline-none">
      <div className="mb-8 rounded-full bg-amber-500/10 p-4">
        <WifiOff className="h-12 w-12 text-amber-500" aria-hidden="true" />
      </div>

      <h1 className="mb-2 text-center font-display text-2xl font-bold tracking-tight">
        You are offline
      </h1>
      <p className="mb-8 text-center text-sm text-surface-text-muted">
        ClarityScans can still be used without an internet connection for essential tools.
      </p>

      <div className="w-full max-w-sm space-y-6">
        {/* Section 1 - Available Offline */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-5">
          <h2 className="mb-3 flex items-center font-display text-base font-semibold">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
            Available Offline
          </h2>
          <ul className="space-y-2 text-sm text-surface-text-muted">
            <li>• Key preparation points for all 5 modules</li>
            <li>• Visual Communication Board</li>
            <li>• Breath-hold Trainer</li>
          </ul>

          <div className="mt-4 flex space-x-3">
            <Link 
              href={`/${locale}/breath-hold`}
              className="flex-1 rounded-lg bg-surface-hover py-2.5 text-center text-sm font-medium transition-colors hover:bg-surface-border"
            >
              Breath Trainer
            </Link>
            <Link 
              href={`/${locale}/visual-guide`}
              className="flex-1 rounded-lg bg-surface-hover py-2.5 text-center text-sm font-medium transition-colors hover:bg-surface-border"
            >
              Visual Guide
            </Link>
          </div>
        </div>

        {/* Section 2 - Requires Connection */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-5">
          <h2 className="mb-3 flex items-center font-display text-base font-semibold">
            <CloudOff className="mr-2 h-4 w-4 text-amber-500" />
            Requires Connection
          </h2>
          <ul className="space-y-3 text-sm text-surface-text-muted">
            <li className="flex items-start">
              <Video className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-surface-text-dim" />
              <span>Module Videos (files are too large to store offline)</span>
            </li>
            <li className="flex items-start">
              <MessageSquare className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-surface-text-dim" />
              <span>Feedback submission (we will save it and send later)</span>
            </li>
          </ul>
        </div>

        {/* Section 3 - What to do */}
        <div className="rounded-xl bg-brand-primary/10 p-5 text-center border border-brand-primary/20">
          <p className="text-sm font-medium text-brand-primary">
            Need to watch a video? Please ask the radiographer for help.
          </p>
        </div>

        <button
          onClick={handleReconnect}
          disabled={checking}
          className="flex w-full items-center justify-center space-x-2 rounded-xl bg-surface-hover py-3.5 text-sm font-medium transition-colors hover:bg-surface-border disabled:opacity-50 min-h-[44px]"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} aria-hidden="true" />
          <span>{checking ? "Checking connection..." : "Try reconnecting"}</span>
        </button>

        <div className="mt-4 text-center">
          <Link
            href="/accessibility"
            className="text-xs text-slate-500 underline underline-offset-4 hover:text-slate-400"
          >
            Accessibility Statement
          </Link>
        </div>
      </div>
    </main>
  );
}
