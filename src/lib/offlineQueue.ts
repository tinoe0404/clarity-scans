import { idbGet, idbSet, idbDelete } from "./indexedDb";

// Create a rough type so we don't need to import the exact schema to avoid circular dependencies
// Or import the actual schema if possible. The schema is usually in src/lib/validations/feedback.ts
// We'll use a type that covers it.
type CreateFeedbackInput = {
  rating: number;
  comments?: string;
  source: string;
};

const QUEUE_KEY = "cs_feedback_queue";

export async function getQueuedFeedback(): Promise<CreateFeedbackInput[]> {
  const data = await idbGet<CreateFeedbackInput[]>(QUEUE_KEY);
  return data || [];
}

export async function queueFeedback(data: CreateFeedbackInput): Promise<void> {
  const currentQueue = await getQueuedFeedback();
  currentQueue.push(data);
  await idbSet(QUEUE_KEY, currentQueue);
  
  // Register background sync if available
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if ("sync" in registration) {
        // @ts-ignore - TS doesn't have SyncManager types by default
        await registration.sync.register("feedback-queue");
      }
    } catch (err) {
      console.error("Background Sync registration failed:", err);
    }
  }
}

export async function clearFeedbackQueue(): Promise<void> {
  await idbDelete(QUEUE_KEY);
}

export async function processFeedbackQueue(): Promise<{ processed: number; failed: number }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { processed: 0, failed: 0 };
  }

  const queue = await getQueuedFeedback();
  if (queue.length === 0) {
    return { processed: 0, failed: 0 };
  }

  const remainingQueue: CreateFeedbackInput[] = [];
  let processedCount = 0;
  let failedCount = 0;

  for (const item of queue) {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        processedCount++;
      } else {
        // If it's a server error (e.g. 500), we probably want to drop it or keep it?
        // Instructions: "removes successfully processed items from the queue".
        // Let's assume non-ok means we keep it to retry later if it's a 50x, or drop if 400.
        // Actually, just keep it if it fails.
        failedCount++;
        remainingQueue.push(item);
      }
    } catch (_error) {
      // Network error, keep in queue
      failedCount++;
      remainingQueue.push(item);
    }
  }

  if (remainingQueue.length > 0) {
    await idbSet(QUEUE_KEY, remainingQueue);
  } else {
    await clearFeedbackQueue();
  }

  return { processed: processedCount, failed: failedCount };
}
