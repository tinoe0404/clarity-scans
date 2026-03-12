import { RefObject, useCallback } from "react";

/**
 * Hook to manage focus movement securely with screen readers to allow DOM updates to complete.
 * Ensures the target element can receive focus.
 */
export function useFocusManagement() {
  const moveFocusTo = useCallback((ref: RefObject<HTMLElement | null>) => {
    // A short timeout lets React's DOM changes render before focus triggers
    setTimeout(() => {
      if (ref.current) {
        // Ensure element is focusable but not necessarily in tab order (-1)
        if (ref.current.tabIndex === undefined || ref.current.tabIndex === null) {
          ref.current.tabIndex = -1;
        }
        ref.current.focus({ preventScroll: false });
      }
    }, 0);
  }, []);

  return { moveFocusTo };
}
