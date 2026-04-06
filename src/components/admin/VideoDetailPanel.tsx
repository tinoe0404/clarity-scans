"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  ExternalLink,
  Copy,
  Check,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Calendar,
  Film,
  Globe,
  Hash,
  FileVideo,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import type { VideoRecord, VideoSlug, Locale } from "@/types";

/* ── Label Mappings ───────────────────────────────── */

const MODULE_LABELS: Record<VideoSlug, string> = {
  "what-is-ct": "What is a CT Scan?",
  prepare: "How to Prepare",
  breathhold: "Breath Hold Practice",
  contrast: "Contrast Injection",
  "staying-still": "Staying Still",
};

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  sn: "ChiShona",
  nd: "isiNdebele",
};

/* ── Helpers ──────────────────────────────────────── */

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-ZW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getFileFormat(blobUrl: string): string {
  try {
    const ext = blobUrl.split(".").pop()?.split("?")[0]?.toLowerCase();
    if (ext === "mp4") return "MP4";
    if (ext === "webm") return "WebM";
    return ext?.toUpperCase() || "Unknown";
  } catch {
    return "Unknown";
  }
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen - 3) + "…";
}

/* ── Props ────────────────────────────────────────── */

interface VideoDetailPanelProps {
  video: VideoRecord;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (newActive: boolean) => void;
}

/* ── Component ────────────────────────────────────── */

export default function VideoDetailPanel({
  video,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleActive,
}: VideoDetailPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleCopy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for non-HTTPS
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }, []);

  if (!isOpen) return null;

  const format = getFileFormat(video.blob_url);
  const durationFormatted = video.duration_seconds
    ? `${Math.floor(video.duration_seconds / 60)}:${String(video.duration_seconds % 60).padStart(2, "0")}`
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-surface-border bg-surface-base",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        {/* ── Header ─────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-border bg-surface-base/95 px-6 py-4 backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-white truncate">
              {video.title || "Untitled Video"}
            </h2>
            <p className="text-xs text-slate-400">
              {MODULE_LABELS[video.slug]} · {LOCALE_LABELS[video.language]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Video Preview ──────────────────────── */}
        <div className="relative mx-6 mt-5 overflow-hidden rounded-2xl border border-surface-border bg-black">
          {video.blob_url ? (
            <>
              <video
                ref={videoRef}
                src={video.blob_url}
                poster={video.thumbnail_url || undefined}
                className="aspect-video w-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                controls={isPlaying}
                preload="metadata"
              />
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/20"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/90 shadow-glow-sm transition-transform hover:scale-110">
                    <Play className="ml-1 h-6 w-6 text-white" />
                  </div>
                </button>
              )}
              {isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute bottom-3 right-3 rounded-lg bg-black/60 p-2 text-white/80 transition-colors hover:bg-black/80 hover:text-white"
                >
                  <Pause className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <div className="flex aspect-video items-center justify-center">
              <div className="text-center">
                <FileVideo className="mx-auto mb-2 h-8 w-8 text-white/20" />
                <p className="text-xs text-slate-500">No video file</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Status Badge ───────────────────────── */}
        <div className="mx-6 mt-4 flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              video.is_active
                ? "bg-medical-green/10 text-medical-green border border-medical-green/20"
                : "bg-medical-amber/10 text-medical-amber border border-medical-amber/20"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                video.is_active ? "bg-medical-green" : "bg-medical-amber"
              )}
            />
            {video.is_active ? "Active" : "Inactive"}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-surface-elevated px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
            <Film className="h-3 w-3" />
            {format}
          </span>

          {video.duration_seconds && (
            <span className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-surface-elevated px-2.5 py-1 text-[10px] font-mono text-slate-300">
              <Clock className="h-3 w-3" />
              {durationFormatted}
            </span>
          )}
        </div>

        {/* ── Properties ─────────────────────────── */}
        <div className="mx-6 mt-5 space-y-1 rounded-2xl border border-surface-border bg-surface-card">
          {/* Title */}
          <PropertyRow
            icon={<Info className="h-3.5 w-3.5" />}
            label="Title"
            value={video.title || "—"}
          />

          {/* Description */}
          <PropertyRow
            icon={<Info className="h-3.5 w-3.5" />}
            label="Description"
            value={video.description || "No description"}
            multiline
          />

          {/* Module */}
          <PropertyRow
            icon={<FileVideo className="h-3.5 w-3.5" />}
            label="Module"
            value={MODULE_LABELS[video.slug]}
            sublabel={video.slug}
          />

          {/* Language */}
          <PropertyRow
            icon={<Globe className="h-3.5 w-3.5" />}
            label="Language"
            value={LOCALE_LABELS[video.language]}
            sublabel={video.language}
          />

          {/* Sort Order */}
          <PropertyRow
            icon={<Hash className="h-3.5 w-3.5" />}
            label="Sort Order"
            value={String(video.sort_order)}
          />

          {/* Blob URL */}
          <div className="flex items-start gap-3 border-b border-surface-border px-4 py-3 last:border-0">
            <span className="mt-0.5 text-slate-500">
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Blob URL
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <p className="truncate text-xs text-slate-300 font-mono">
                  {truncateUrl(video.blob_url, 50)}
                </p>
                <button
                  onClick={() => handleCopy(video.blob_url, "blob")}
                  className="shrink-0 rounded p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                  title="Copy URL"
                >
                  {copiedField === "blob" ? (
                    <Check className="h-3 w-3 text-medical-green" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                <a
                  href={video.blob_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Thumbnail URL */}
          <div className="flex items-start gap-3 border-b border-surface-border px-4 py-3 last:border-0">
            <span className="mt-0.5 text-slate-500">
              <ImageIcon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Thumbnail
              </p>
              {video.thumbnail_url ? (
                <div className="mt-1 flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnail_url}
                    alt="Thumbnail"
                    className="h-8 w-14 rounded object-cover border border-surface-border"
                  />
                  <button
                    onClick={() => handleCopy(video.thumbnail_url || "", "thumb")}
                    className="rounded p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                    title="Copy thumbnail URL"
                  >
                    {copiedField === "thumb" ? (
                      <Check className="h-3 w-3 text-medical-green" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="mt-0.5 text-xs text-slate-500 italic">No thumbnail set</p>
              )}
            </div>
          </div>

          {/* Created At */}
          <PropertyRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Created"
            value={formatDate(video.created_at)}
            sublabel={timeAgo(video.created_at)}
          />

          {/* Updated At */}
          <PropertyRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Last Updated"
            value={formatDate(video.updated_at)}
            sublabel={timeAgo(video.updated_at)}
            isLast
          />
        </div>

        {/* ── Quick Actions ──────────────────────── */}
        <div className="mx-6 mt-5 mb-8 grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              onClose();
              setTimeout(onEdit, 150);
            }}
            className={cn(
              buttonStyles("secondary", "sm"),
              "flex flex-col items-center gap-1 h-auto py-3 text-xs"
            )}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>

          <button
            onClick={() => onToggleActive(!video.is_active)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border px-4 py-3 text-xs font-semibold transition-colors",
              video.is_active
                ? "border-medical-amber/20 bg-medical-amber/5 text-medical-amber hover:bg-medical-amber/10"
                : "border-medical-green/20 bg-medical-green/5 text-medical-green hover:bg-medical-green/10"
            )}
          >
            {video.is_active ? (
              <ToggleLeft className="h-4 w-4" />
            ) : (
              <ToggleRight className="h-4 w-4" />
            )}
            {video.is_active ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={() => {
              onClose();
              setTimeout(onDelete, 150);
            }}
            className={cn(
              buttonStyles("danger", "sm"),
              "flex flex-col items-center gap-1 h-auto py-3 text-xs"
            )}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Property Row Subcomponent ────────────────────── */

function PropertyRow({
  icon,
  label,
  value,
  sublabel,
  multiline,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  multiline?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3",
        !isLast && "border-b border-surface-border"
      )}
    >
      <span className="mt-0.5 text-slate-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-xs text-white",
            multiline && "whitespace-pre-wrap text-slate-300"
          )}
        >
          {value}
        </p>
        {sublabel && (
          <p className="mt-0.5 text-[10px] text-slate-500 font-mono">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
