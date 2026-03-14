import { logger } from './logger';

/**
 * Safely parses and validates items from localStorage.
 * If data in localStorage is corrupted or invalid, it returns null.
 *
 * @param key The localStorage key to retrieve
 * @param validator A type guard function validating the retrieved data matches type T
 * @returns The validated value or null if parsing/validation fails
 */
export function safeGet<T>(key: string, validator: (value: unknown) => value is T): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    // First attempt to parse assuming it's JSON serialization.
    let parsed: unknown;
    try {
      parsed = JSON.parse(itemStr);
    } catch {
      // If it's not JSON (like a plain UUID string), use the raw string.
      parsed = itemStr;
    }

    if (validator(parsed)) {
      return parsed;
    } else {
      logger.warn(`Data at localStorage key "${key}" failed validation. Clearing.`);
      safeDelete(key);
      return null;
    }
  } catch (error) {
    logger.warn(`Failed to read from localStorage key "${key}"`, error as Error);
    return null;
  }
}

/**
 * Safely serializes and saves items to localStorage.
 * Does not throw on quota exceeded errors; logs and returns false instead.
 *
 * @param key The localStorage key to set
 * @param value The value to serialize and set
 * @returns True if successfully set, false if an error occurred
 */
export function safeSet(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    logger.warn(`Failed to set localStorage key "${key}"`, error as Error);
    return false;
  }
}

/**
 * Safely removes items from localStorage without throwing.
 *
 * @param key The localStorage key to remove
 */
export function safeDelete(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    logger.warn(`Failed to delete localStorage key "${key}"`, error as Error);
  }
}
