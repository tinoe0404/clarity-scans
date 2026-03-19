import { track } from "@vercel/analytics";

import { useCallback } from "react";

/**
 * Custom hook for sending telemetry to Vercel Analytics.
 * Wraps @vercel/analytics track to isolate its usage to this specific file,
 * making future modifications or swapping analytics providers trivial.
 *
 * It is completely non-blocking, operating async and silently catching errors.
 */
export function useAnalytics() {
  const trackEvent = useCallback((
    eventName: string,
    properties?: Record<string, string | number | boolean | null>
  ) => {
    try {
      if (process.env.NODE_ENV !== "production") {
        console.debug("[Analytics Event]", eventName, properties);
        return; // Prevents polluting production analytics internally
      }
      track(eventName, properties);
    } catch (err) {
      // Silently swallow analytics failures avoiding breaking the UX
      console.warn("Analytics tracking failed:", err);
    }
  }, []);

  return { trackEvent };
}
