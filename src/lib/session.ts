export const SESSION_KEY = "cs_session_id";
export const WATCHED_KEY = "cs_watched_modules";
import type { VideoSlug } from "@/types";

export function clearPatientSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(WATCHED_KEY);
}

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, id);
}

export function getWatchedModules(): VideoSlug[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(WATCHED_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addWatchedModule(slug: VideoSlug): void {
  if (typeof window === "undefined") return;
  const current = getWatchedModules();
  if (!current.includes(slug)) {
    current.push(slug);
    localStorage.setItem(WATCHED_KEY, JSON.stringify(current));
  }
}

export function isModuleWatched(slug: VideoSlug): boolean {
  if (typeof window === "undefined") return false;
  const current = getWatchedModules();
  return current.includes(slug);
}
