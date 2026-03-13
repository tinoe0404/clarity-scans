import { logger } from './logger';

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Executes a promise-returning function with exponential backoff and jitter.
 * 
 * @param fn The async function to execute
 * @param options Retry configuration options
 * @returns The resolved value of the promise
 * @throws The last error encountered if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts,
    initialDelayMs,
    backoffMultiplier = 2,
    shouldRetry = () => true, // Retry on all errors by default
  } = options;

  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt >= maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      // delay = initialDelayMs * (multiplier ^ attempt) + random(0-100)
      const delay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1) + Math.random() * 100;

      logger.warn(`Operation failed (attempt ${attempt}/${maxAttempts}). Retrying in ${Math.round(delay)}ms`, error as any);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should theoretically never be reached because of the throw in the catch block
  throw new Error('Retry logic exhausted');
}
