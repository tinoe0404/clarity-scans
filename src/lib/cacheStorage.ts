export async function getCacheSize(): Promise<number> {
  if (typeof caches === "undefined") return 0;

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const name of cacheNames) {
      if (!name.startsWith("workbox-") && !name.includes("clarityScans")) continue;
      
      const cache = await caches.open(name);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          // Estimate size from Content-Length header if available
          const contentLength = response.headers.get("content-length");
          if (contentLength) {
            totalSize += parseInt(contentLength, 10);
          } else {
            // Rough estimate for typical HTML/JS/CSS responses if no content-length
            const clone = response.clone();
            const blob = await clone.blob();
            totalSize += blob.size;
          }
        }
      }
    }

    return totalSize;
  } catch (error) {
    console.error("Failed to estimate cache size:", error);
    return 0;
  }
}

export async function clearAppCache(): Promise<void> {
  if (typeof caches === "undefined") return;

  try {
    const cacheNames = await caches.keys();
    for (const name of cacheNames) {
      // Clear all caches created by our PWA (workbox managed or custom API caches)
      if (
        name.includes("api-cache") || 
        name.includes("patient-pages") ||
        name.includes("static-assets") ||
        name.includes("static-resources") ||
        name.includes("google-fonts") ||
        name.includes("blob-thumbnails") ||
        name.includes("blob-videos-fallback") ||
        name.startsWith("workbox-")
      ) {
        await caches.delete(name);
      }
    }
  } catch (error) {
    console.error("Failed to clear app caches:", error);
  }
}

export async function precacheStatus(): Promise<{ total: number; cached: number; routes: string[] }> {
  if (typeof caches === "undefined") return { total: 0, cached: 0, routes: [] };

  try {
    const cacheNames = await caches.keys();
    const patientPageCacheName = cacheNames.find(n => n.includes("patient-pages"));
    
    if (!patientPageCacheName) return { total: 0, cached: 0, routes: [] };

    const cache = await caches.open(patientPageCacheName);
    const requests = await cache.keys();
    const routes = requests.map(req => new URL(req.url).pathname);
    
    return {
      total: routes.length,
      cached: routes.length,
      routes
    };
  } catch (error) {
    console.error("Failed to get precache status:", error);
    return { total: 0, cached: 0, routes: [] };
  }
}
