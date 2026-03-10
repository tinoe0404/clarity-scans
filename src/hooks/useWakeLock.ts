import { useState, useEffect, useRef, useCallback } from "react";

interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

export function useWakeLock(): UseWakeLockReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  // Store Sentinel actively enforcing Screen Wake 
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "wakeLock" in navigator) {
      setIsSupported(true);
    }
  }, []);

  const request = useCallback(async () => {
    if (!isSupported) return;
    
    try {
      sentinelRef.current = await navigator.wakeLock.request("screen");
      setIsActive(true);

      // Listen for background closure
      sentinelRef.current.addEventListener("release", () => {
        setIsActive(false);
        sentinelRef.current = null;
      });
      
    } catch (err) {
      // Graceful error silences: Low battery naturally denies wake targets.
      console.warn("Wake Lock request failed:", err);
      setIsActive(false);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch (err) {
        console.warn("Wake Lock release failed:", err);
      } finally {
        sentinelRef.current = null;
        setIsActive(false);
      }
    }
  }, []);

  // Ensure lock restores correctly post tab-switching
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSupported, request]);

  // Clean unmount sweep naturally
  useEffect(() => {
    return () => {
      release();
    };
  }, [release]);

  return { isSupported, isActive, request, release };
}
