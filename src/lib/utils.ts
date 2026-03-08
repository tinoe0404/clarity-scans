import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Locale, LOCALES } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} min`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getDeviceType(): "tablet" | "phone" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  return window.innerWidth >= 768 ? "tablet" : "phone";
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}
