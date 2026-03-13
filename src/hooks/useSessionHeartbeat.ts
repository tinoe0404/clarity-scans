import { useEffect } from 'react';
import { getSessionId } from '@/lib/session';
import { handleClientError } from '@/lib/globalErrorHandler';

// Ping every 5 minutes
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

export function useSessionHeartbeat() {
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function pingSession() {
      // Don't ping if offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }

      const sessionId = getSessionId();
      if (!sessionId) return;

      try {
        const controller = new AbortController();
        // Short timeout for background pings so they fail fast silently
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceType: 'unknown' }), // Dummy payload just to trigger last_active_at touch
        });

        clearTimeout(timeoutId);

        if (!res.ok && res.status >= 500) {
          throw new Error(`Session heartbeat failed with ${res.status}`);
        }
      } catch (error) {
        // Silently handle heartbeat failures, don't interrupt UX
        handleClientError(error, 'useSessionHeartbeat ping failed');
      }
    }

    // Ping immediately on mount if online
    pingSession();

    // Set up regular interval
    intervalId = setInterval(pingSession, HEARTBEAT_INTERVAL_MS);

    // Also ping when coming back online
    const handleOnline = () => pingSession();
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
}
