/// <reference lib="webworker" />

// Use any cast to bypass Next.js DOM typings conflicting with SW typings
const sw = self as any;

// IndexedDB Helper copied locally for SW since we can't import straightforwardly 
// in standard ES next-pwa worker setups without heavier bundler configs.
const DB_NAME = "clarityscans_db";
const DB_VERSION = 1;
const STORE_NAME = "keyval";
const QUEUE_KEY = "cs_feedback_queue";

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function idbGetQueue(): Promise<any[]> {
  return getDB().then(
    (db) =>
      new Promise<any[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(QUEUE_KEY);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      })
  ).catch(() => []);
}

function idbSetQueue(queue: any[]): Promise<void> {
  return getDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(queue, QUEUE_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
  ).catch(console.error);
}

function idbClearQueue(): Promise<void> {
  return getDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(QUEUE_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
  ).catch(console.error);
}

// Ensure the queue actually exists when trying to process it 
async function syncFeedbackQueue() {
  const queue = await idbGetQueue();
  if (!queue || queue.length === 0) return;

  const remainingQueue = [];
  let processed = 0;

  for (const item of queue) {
    try {
      // Must use absolute or relative URLs carefully in SW. 
      // Current origin is best.
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        processed++;
      } else {
        remainingQueue.push(item);
      }
    } catch (error) {
      remainingQueue.push(item);
    }
  }

  if (remainingQueue.length > 0) {
    await idbSetQueue(remainingQueue);
  } else {
    await idbClearQueue();
  }

  // Notify clients
  const clients = await sw.clients.matchAll();
  for (const client of clients) {
    client.postMessage({
      type: "SYNC_COMPLETE",
      tag: "feedback-queue",
      processed
    });
  }
}

sw.addEventListener("sync", (event: any) => {
  if (event.tag === "feedback-queue") {
    console.log("Service Worker Background Sync triggered for feedback queue");
    event.waitUntil(syncFeedbackQueue());
  }
});
