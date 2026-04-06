/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Upload, X, Play, Pencil, Trash2, ToggleLeft, ToggleRight, Check, Eye } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { VideoRecord } from "@/types";
import { generateBlurPlaceholder } from "@/lib/imageUtils";

type CellState = "empty" | "uploading" | "inactive" | "active";

/* ── Helpers ──────────────────────────────────────── */

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
    return ext?.toUpperCase() || "—";
  } catch {
    return "—";
  }
}

/* ── Props ────────────────────────────────────────── */

interface VideoMatrixCellProps {
  video: VideoRecord | null;
  uploadProgress: number | null; // 0-100 when uploading, null otherwise
  uploadFileName: string | null;
  isBulkMode: boolean;
  isSelected: boolean;
  onUpload: () => void;
  onCancelUpload: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (newActive: boolean) => void;
  onBulkSelect: (selected: boolean) => void;
  onViewDetails: () => void;
}

export default function VideoMatrixCell({
  video,
  uploadProgress,
  uploadFileName,
  isBulkMode,
  isSelected,
  onUpload,
  onCancelUpload,
  onEdit,
  onDelete,
  onToggleActive,
  onBulkSelect,
  onViewDetails,
}: VideoMatrixCellProps) {
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const state: CellState =
    uploadProgress !== null
      ? "uploading"
      : video
        ? video.is_active
          ? "active"
          : "inactive"
        : "empty";

  const borderColor = {
    empty: "border-dashed border-white/10",
    uploading: "border-brand-500/30",
    inactive: "border-medical-amber/30",
    active: "border-medical-green/30",
  }[state];

  const handleToggle = () => {
    if (video?.is_active) {
      setShowDeactivateConfirm(true);
    } else {
      onToggleActive(true);
    }
  };

  const confirmDeactivate = () => {
    setShowDeactivateConfirm(false);
    onToggleActive(false);
  };

  return (
    <div
      className={cn(
        "relative flex min-h-[140px] flex-col rounded-xl border p-3 transition-all duration-300",
        borderColor,
        isSelected && "ring-2 ring-brand-500/40"
      )}
    >
      {/* Presence indicator dot */}
      <div className="absolute right-2 top-2 z-10">
        {state === "empty" ? (
          <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full border border-white/20" />
        ) : state === "uploading" ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
          </span>
        ) : state === "active" ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-medical-green opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-medical-green" />
          </span>
        ) : (
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-medical-amber" />
        )}
      </div>

      {/* Bulk select checkbox */}
      {isBulkMode && video && (
        <label className="absolute left-2 top-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-white/20 bg-surface-base">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onBulkSelect(e.target.checked)}
            className="sr-only"
          />
          {isSelected && <Check className="h-3 w-3 text-brand-400" />}
        </label>
      )}

      {/* EMPTY STATE */}
      {state === "empty" && (
        <button
          onClick={onUpload}
          className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg text-slate-500 transition-colors hover:bg-white/[0.03] hover:text-slate-300"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs font-medium">Upload</span>
          <span className="text-[10px] text-slate-600">No video</span>
        </button>
      )}

      {/* UPLOADING STATE */}
      {state === "uploading" && (
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="max-w-[100px] truncate text-xs text-slate-300">
              {uploadFileName || "Uploading..."}
            </span>
            <button
              onClick={onCancelUpload}
              className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-auto">
            <div className="mb-1 text-right text-[10px] text-brand-300">
              {Math.round(uploadProgress ?? 0)}%
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${uploadProgress ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* INACTIVE STATE */}
      {state === "inactive" && video && !showDeactivateConfirm && (
        <div className="flex flex-1 flex-col">
          {/* Thumbnail + duration */}
          <button
            onClick={onViewDetails}
            className="relative mb-2 flex-1 overflow-hidden rounded-lg bg-black/30 cursor-pointer group"
          >
            {video.thumbnail_url ? (
              <Image
                src={video.thumbnail_url}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={generateBlurPlaceholder(320, 180, "#1e293b")}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[48px] items-center justify-center">
                <Play className="h-4 w-4 text-white/20" />
              </div>
            )}
            {video.duration_seconds && (
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                {Math.floor(video.duration_seconds / 60)}:
                {String(video.duration_seconds % 60).padStart(2, "0")}
              </span>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
              <Eye className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>

          {/* Title + format */}
          <div className="mb-1.5 flex items-center gap-1.5">
            <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-slate-300">
              {video.title}
            </p>
            <span className="shrink-0 rounded bg-surface-elevated px-1 py-0.5 text-[8px] font-bold uppercase text-slate-400 border border-surface-border">
              {getFileFormat(video.blob_url)}
            </span>
          </div>

          {/* Date */}
          <p className="mb-1.5 text-[9px] text-slate-600">
            {timeAgo(video.updated_at)}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={handleToggle}
              className="flex min-h-[28px] items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-medical-amber transition-colors hover:bg-medical-amber/10"
            >
              <ToggleLeft className="h-3.5 w-3.5" />
              Activate
            </button>
            <div className="flex gap-1">
              <button
                onClick={onViewDetails}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-brand-400"
                title="View details"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onEdit}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                title="Edit metadata"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-lg text-slate-400 hover:bg-medical-red/10 hover:text-medical-red"
                title="Delete video"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE STATE */}
      {state === "active" && video && !showDeactivateConfirm && (
        <div className="flex flex-1 flex-col">
          {/* Thumbnail + duration */}
          <button
            onClick={onViewDetails}
            className="relative mb-2 flex-1 overflow-hidden rounded-lg bg-black/30 cursor-pointer group"
          >
            {video.thumbnail_url ? (
              <Image
                src={video.thumbnail_url}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={generateBlurPlaceholder(320, 180, "#1e293b")}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[48px] items-center justify-center">
                <Play className="h-4 w-4 text-white/20" />
              </div>
            )}
            {video.duration_seconds && (
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                {Math.floor(video.duration_seconds / 60)}:
                {String(video.duration_seconds % 60).padStart(2, "0")}
              </span>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
              <Eye className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>

          {/* Title + format */}
          <div className="mb-1.5 flex items-center gap-1.5">
            <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-white">
              {video.title}
            </p>
            <span className="shrink-0 rounded bg-surface-elevated px-1 py-0.5 text-[8px] font-bold uppercase text-slate-400 border border-surface-border">
              {getFileFormat(video.blob_url)}
            </span>
          </div>

          {/* Date */}
          <p className="mb-1.5 text-[9px] text-slate-600">
            {timeAgo(video.updated_at)}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={handleToggle}
              className="flex min-h-[28px] items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-medical-green transition-colors hover:bg-medical-green/10"
            >
              <ToggleRight className="h-3.5 w-3.5" />
              Active
            </button>
            <div className="flex gap-1">
              <button
                onClick={onViewDetails}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-brand-400"
                title="View details"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onEdit}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                title="Edit metadata"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-lg text-slate-400 hover:bg-medical-red/10 hover:text-medical-red"
                title="Delete video"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INLINE DEACTIVATION CONFIRM */}
      {showDeactivateConfirm && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="text-[11px] text-slate-300">Deactivate? Patients will no longer see it.</p>
          <div className="flex gap-2">
            <button
              onClick={confirmDeactivate}
              className="rounded-lg bg-medical-amber/10 px-3 py-1.5 text-[10px] font-medium text-medical-amber hover:bg-medical-amber/20"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowDeactivateConfirm(false)}
              className="rounded-lg px-3 py-1.5 text-[10px] text-slate-400 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
