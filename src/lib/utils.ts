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

// --- Blob Storage Utilities ---

export function isBlobUrl(url: string): boolean {
  return (
    url.includes(".public.blob.vercel-storage.com") ||
    url.startsWith("http://localhost:3000/mock-blob/")
  );
}

export function isPlaceholderUrl(url: string): boolean {
  return url === "PLACEHOLDER";
}

export function getBlobFilename(url: string): string | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function estimateVideoDuration(fileSizeBytes: number, bitratekbps = 500): number {
  // duration (s) = size (bits) / bitrate (bits/s)
  const sizeBits = fileSizeBytes * 8;
  const bitrateBitsPerSec = bitratekbps * 1000;
  return Math.round(sizeBits / bitrateBitsPerSec);
}
