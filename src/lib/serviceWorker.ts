"use client";

// Based on standard PWA update patterns
// This will be called in the root layout to handle SW updates gracefully.

type SWMessage = 
  | { type: 'CACHE_FULL'; url: string }
  | { type: 'VIDEO_CACHED'; url: string }
  | { type: 'SYNC_COMPLETE'; tag: string };

export function registerServiceWorkerEvents(showToast: (title: string, msg: string, action?: { label: string, onClick: () => void }) => void) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // Handle updates
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    showToast(
      "App updated",
      "A new version is available. Refresh to update.",
      {
        label: "Refresh Now",
        onClick: () => window.location.reload()
      }
    );
  });

  // Handle messages from SW
  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data as SWMessage;
    if (!data || !data.type) return;

    switch (data.type) {
      case 'SYNC_COMPLETE':
        if (data.tag === 'feedback-queue') {
          console.log("Background sync for feedback completed");
        }
        break;
      // Handle other types if necessary
    }
  });
}

export async function checkForUpdates(): Promise<void> {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    } catch (err) {
      console.error("Failed to check for service worker updates:", err);
    }
  }
}
