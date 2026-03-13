/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Upload, X, Play, Pencil, Trash2, ToggleLeft, ToggleRight, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { VideoRecord } from "@/types";
import { generateBlurPlaceholder } from "@/lib/imageUtils";

type CellState = "empty" | "uploading" | "inactive" | "active";

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
        "relative flex min-h-[120px] flex-col rounded-xl border p-3 transition-all duration-300",
        borderColor,
        isSelected && "ring-2 ring-brand-500/40"
      )}
    >
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
          <div className="relative mb-2 flex-1 overflow-hidden rounded-lg bg-black/30">
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={handleToggle}
              className="flex min-h-[32px] items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-medical-amber transition-colors hover:bg-medical-amber/10"
            >
              <ToggleLeft className="h-3.5 w-3.5" />
              Activate
            </button>
            <div className="flex gap-1">
              <button
                onClick={onEdit}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-lg text-slate-400 hover:bg-medical-red/10 hover:text-medical-red"
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
          <div className="relative mb-2 flex-1 overflow-hidden rounded-lg bg-black/30">
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={handleToggle}
              className="flex min-h-[32px] items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-medical-green transition-colors hover:bg-medical-green/10"
            >
              <ToggleRight className="h-3.5 w-3.5" />
              Active
            </button>
            <div className="flex gap-1">
              <button
                onClick={onEdit}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-lg text-slate-400 hover:bg-medical-red/10 hover:text-medical-red"
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
