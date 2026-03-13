import { idbGet, idbSet, idbDelete } from "./indexedDb";
import { createFeedbackSchema, type CreateFeedbackInput } from "./validations";
import { logger } from "./logger";

const QUEUE_KEY = "cs_feedback_queue";

export async function getQueuedFeedback(): Promise<CreateFeedbackInput[]> {
  const data = await idbGet<unknown[]>(QUEUE_KEY);
  if (!Array.isArray(data)) return [];

  const validItems: CreateFeedbackInput[] = [];
  let dropped = 0;

  for (const item of data) {
    const result = createFeedbackSchema.safeParse(item);
    if (result.success) {
      validItems.push(result.data);
    } else {
      dropped++;
    }
  }

  if (dropped > 0) {
    logger.warn(`Dropped ${dropped} invalid feedback items from offline queue`);
  }

  return validItems;
}

export async function queueFeedback(data: CreateFeedbackInput): Promise<void> {
  const validData = createFeedbackSchema.parse(data);
  const currentQueue = await getQueuedFeedback();
  currentQueue.push(validData);
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
      logger.warn("Background Sync registration failed:", err as any);
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
        // Only keep if server error (500+). Discard if client error (4xx) avoiding infinite loops of bad data.
        if (res.status >= 500) {
          failedCount++;
          remainingQueue.push(item);
        } else {
          logger.warn(`Discarding rejected offline feedback (Status: ${res.status})`);
        }
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
