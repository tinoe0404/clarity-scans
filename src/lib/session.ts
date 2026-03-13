export const SESSION_KEY = "cs_session_id";
export const WATCHED_KEY = "cs_watched_modules";
import type { VideoSlug } from "@/types";
import { safeGet, safeSet, safeDelete } from "./safeStorage";

export function clearPatientSession(): void {
  safeDelete(SESSION_KEY);
  safeDelete(WATCHED_KEY);
}

export function getSessionId(): string | null {
  // UUID fast verification check
  return safeGet(SESSION_KEY, (val): val is string => {
    return typeof val === "string" && 
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
  });
}

export function setSessionId(id: string): void {
  safeSet(SESSION_KEY, id);
}

export function getWatchedModules(): VideoSlug[] {
  const validSlugs: VideoSlug[] = ["what-is-ct", "prepare", "breathhold", "contrast", "staying-still"];
  
  const parsed = safeGet(WATCHED_KEY, (val): val is VideoSlug[] => {
    return Array.isArray(val) && val.every((item) => validSlugs.includes(item as VideoSlug));
  });

  return parsed || [];
}

export function addWatchedModule(slug: VideoSlug): void {
  const current = getWatchedModules();
  if (!current.includes(slug)) {
    current.push(slug);
    safeSet(WATCHED_KEY, current);
  }
}

export function isModuleWatched(slug: VideoSlug): boolean {
  const current = getWatchedModules();
  return current.includes(slug);
}
