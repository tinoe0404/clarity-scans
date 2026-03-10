import { useEffect } from "react";

export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is currently inside an input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.code; // Prefer code over key for consistent physical mapping
      
      if (shortcuts[key]) {
        e.preventDefault(); // Prevent default browser behaviors (like scrolling on space)
        shortcuts[key]();
      } else if (e.key === ' ' && shortcuts['Space']) {
        // Fallback for browsers returning ' ' for spacebar instead of 'Space'
        e.preventDefault();
        shortcuts['Space']();
      } else if (shortcuts[e.key]) {
        // General fallback to e.key (e.g. 'Escape')
        if (e.key !== "Tab" && e.key !== "Enter") { // Avoid stealing core accessibility keys accidentally
           e.preventDefault();
        }
        shortcuts[e.key]();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}
