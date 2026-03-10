import { useEffect, useRef } from "react";
import type { VideoSlug } from "@/types";

/**
 * Debounced best-effort sync copying `localStorage` array up to Postgres
 * Requires `sessionId` parameter (which is the session_id UUID key).
 */
export function useSessionSync(
  sessionId: string | null,
  watchedModules: VideoSlug[]
): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Escape condition
    if (!sessionId || typeof window === "undefined") return;

    // Clear currently pending debounce ticks on rapidly changing values
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Wait 500ms before sending PATCH, accumulating rapid clicks securely.
    timeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completedModules: watchedModules,
          }),
        });
        // Note: No success toast or UI interference. Background sync exclusively.
      } catch (error) {
        // Suppress failure logs or metrics dropping as LocalStorage holds Source of Truth
        console.error("Session sync best-effort failed:", error);
      }
    }, 500);

    return () => {
      // Clear interval on unmount immediately preventing trailing dispatches
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sessionId, watchedModules]);
}
