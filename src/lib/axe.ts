/**
 * Axe-core accessibility testing utility.
 * Only runs in development mode — never in production.
 * Logs WCAG violations to the browser console.
 */
export async function initAxe(): Promise<void> {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "development") return;

  try {
    const React = await import("react");
    const ReactDOM = await import("react-dom");
    const axe = await import("@axe-core/react");

    // Run axe after a 1-second delay to allow page content to render
    axe.default(React.default, ReactDOM, 1000, {
      rules: [
        // Ensure color-contrast is checked
        { id: "color-contrast", enabled: true },
      ],
    });

    console.log(
      "%c[axe-core] Accessibility testing active in development",
      "color: #4CAF50; font-weight: bold"
    );
  } catch (error) {
    // axe-core is a devDependency — silently ignore if not installed
    console.warn("[axe-core] Could not initialize:", error);
  }
}
