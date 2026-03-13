import { fetchWithTimeout, FetchWithTimeoutOptions } from './fetchWithTimeout';

/**
 * Wrapper for admin dashboard API requests.
 * Automatically handles session expiry (401 Unauthorized) by redirecting
 * the radiographer back to the login page with a return callback Url.
 * 
 * @param url The API endpoint to fetch
 * @param options Standard fetch options, including timeout control
 * @returns Promise resolving to the Response
 */
export async function adminFetch(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const response = await fetchWithTimeout(url, options);

  if (response.status === 401 && typeof window !== 'undefined') {
    // If we're on the client and the admin session expired, force a redirect
    const currentPath = window.location.pathname;
    window.location.href = `/admin/login?callbackUrl=${encodeURIComponent(currentPath)}`;
    
    // We throw to stop execution of the caller while the redirect happens
    throw new Error('Admin session expired - redirecting to login');
  }

  return response;
}
