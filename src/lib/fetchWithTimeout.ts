import { API_TIMEOUT_MS } from './constants';
import { NetworkError } from './errorTypes';

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * A wrapper around the native fetch API that adds timeout support.
 * If the request exceeds the timeout, it aborts the request and throws a structured NetworkError.
 * 
 * @param url The URL to fetch
 * @param options Fetch options, plus an optional `timeoutMs` override (defaults to 10s)
 * @returns Promise resolving to the Response
 */
export async function fetchWithTimeout(
  url: string | URL | Request,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = API_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  
  // If the user provided their own signal, we need to link it
  if (fetchOptions.signal) {
    fetchOptions.signal.addEventListener('abort', () => {
      controller.abort();
    });
  }
  
  fetchOptions.signal = controller.signal;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const networkError: NetworkError = {
        type: 'NetworkError',
        message: `Request to ${url.toString()} timed out after ${timeoutMs}ms`,
        originalError: error,
      };
      throw networkError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
