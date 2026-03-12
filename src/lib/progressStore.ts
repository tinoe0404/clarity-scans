/**
 * In-memory upload progress tracker.
 * Lives in a shared module so route files don't export non-standard symbols
 * that conflict with Next.js typedRoutes validation.
 */
export const progressStore = new Map<
  string,
  {
    progress: number;
    status: "uploading" | "processing" | "complete" | "error";
    lastUpdated: number;
  }
>();
