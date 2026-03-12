"use client";

import { useState, useEffect } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff, Wifi } from "lucide-react";
import { processFeedbackQueue } from "@/lib/offlineQueue";

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      
      // Attempt to sync the feedback queue
      processFeedbackQueue().then((summary) => {
        if (summary.processed > 0) {
          setSyncMessage(`Back online — ${summary.processed} feedback submissions synced.`);
        } else {
          setSyncMessage(null);
        }
      });

      const timer = setTimeout(() => {
        setShowReconnected(false);
        setSyncMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-2 text-sm font-medium transition-transform duration-300 ${
        !isOnline 
          ? "translate-y-0 bg-amber-500 text-amber-950" 
          : "translate-y-0 bg-green-500 text-green-950"
      }`}
      style={{
        transform: (!isOnline || showReconnected) ? "translateY(0)" : "translateY(-100%)"
      }}
    >
      {!isOnline ? (
        <>
          <WifiOff className="mr-2 h-4 w-4" />
          No internet connection — some features may be unavailable
        </>
      ) : (
        <>
          <Wifi className="mr-2 h-4 w-4" />
          {syncMessage || "Back online"}
        </>
      )}
    </div>
  );
}
