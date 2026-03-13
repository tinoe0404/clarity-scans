import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionId } from '@/lib/session';
import { Locale } from '@/types';
import { handleClientError } from '@/lib/globalErrorHandler';
import { SessionError } from '@/lib/errorTypes';

export function useSessionGuard(locale: Locale) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      try {
        const sessionId = getSessionId();

        // 1. Local validation (UUID format)
        if (!sessionId) {
          throw new Error('No valid session ID found in local storage');
        }

        // 2. Remote verification (short timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`/api/sessions/${sessionId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Session API returned ${res.status}`);
        }

        if (mounted) {
          setIsVerifying(false);
        }
      } catch (error) {
        if (mounted) {
          handleClientError(error, 'useSessionGuard validation failed');
          // If any check fails, redirect to language picker with reason
          router.replace(`/${locale}?reason=session_expired`);
        }
      }
    }

    verifySession();

    return () => {
      mounted = false;
    };
  }, [locale, router]);

  return { isVerifying };
}
