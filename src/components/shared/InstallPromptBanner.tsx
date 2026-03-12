"use client";

import { useState, useEffect } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Download, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function InstallPromptBanner() {
  const { canInstall, install, isInstalled } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true); // default true to prevent hydration mismatch blink
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client
    const isDismissed = localStorage.getItem("cs_pwa_prompt_dismissed") === "true";
    setDismissed(isDismissed);
  }, []);

  // Do not show on admin pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/api")) {
    return null;
  }

  if (!canInstall || isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem("cs_pwa_prompt_dismissed", "true");
    setDismissed(true);
  };

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === 'accepted') {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-brand-500/20 bg-surface-card p-4 shadow-2xl animate-in slide-in-from-bottom-10">
      <button 
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-surface-text-dim transition-colors hover:bg-surface-hover hover:text-white"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start pr-6">
        <div className="mr-3 mt-0.5 rounded-lg bg-brand-500/10 p-2">
          <Download className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-white">Install ClarityScans</h3>
          <p className="mt-1 text-xs text-surface-text-muted">
            Add to your home screen for quick offline access.
          </p>
          <button 
            onClick={handleInstall}
            className="mt-3 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-400"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
