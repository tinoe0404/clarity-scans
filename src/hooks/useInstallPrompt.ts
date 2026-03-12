"use client";

import { useState, useEffect, useRef } from "react";

// The BeforeInstallPromptEvent interface is not broadly typed in standard lib
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed via display-mode media query
    const mqStandalone = window.matchMedia('(display-mode: standalone)');
    const mqFullscreen = window.matchMedia('(display-mode: fullscreen)');
    
    setIsInstalled(mqStandalone.matches || mqFullscreen.matches);

    const checkInstalled = () => {
      setIsInstalled(mqStandalone.matches || mqFullscreen.matches);
    };

    mqStandalone.addEventListener('change', checkInstalled);
    mqFullscreen.addEventListener('change', checkInstalled);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    // Also listen for appinstalled event to hide the prompt immediately
    const handleAppInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
      deferredPrompt.current = null;
    };
    
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mqStandalone.removeEventListener('change', checkInstalled);
      mqFullscreen.removeEventListener('change', checkInstalled);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt.current) return 'unavailable';

    try {
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
      
      deferredPrompt.current = null;
      return outcome;
    } catch (err) {
      console.error("Install prompt error:", err);
      return 'unavailable';
    }
  };

  return { canInstall, install, isInstalled };
}
