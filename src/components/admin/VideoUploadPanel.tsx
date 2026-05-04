"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, FileVideo, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import { MAX_VIDEO_SIZE_BYTES, ACCEPTED_VIDEO_TYPES } from "@/lib/constants";
import type { Locale, VideoSlug } from "@/types";

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

interface VideoUploadPanelProps {
  isOpen: boolean;
  slug: VideoSlug;
  locale: Locale;
  onClose: () => void;
  onUpload: (file: File, title: string, description: string) => void;
}

export default function VideoUploadPanel({
  isOpen,
  slug,
  locale,
  onClose,
  onUpload,
}: VideoUploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(`${MODULE_LABELS[slug]}`);
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((f: File): string | null => {
    if (!ACCEPTED_VIDEO_TYPES.includes(f.type as (typeof ACCEPTED_VIDEO_TYPES)[number])) {
      return `Invalid file type. Accepted: MP4, WebM`;
    }
    if (f.size > MAX_VIDEO_SIZE_BYTES) {
      return `File too large. Maximum: ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)}MB`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      const err = validateFile(f);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      setFile(f);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleSubmit = () => {
    if (!file) return;
    onUpload(file, title, description);
    onClose();
  };

  const reset = () => {
    setFile(null);
    setTitle(`${MODULE_LABELS[slug]}`);
    setDescription("");
    setError(null);
    setDragOver(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl border border-surface-border bg-surface-card p-6 md:rounded-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Upload Video</h2>
            <p className="text-sm text-slate-400">
              {MODULE_LABELS[slug]} · {LOCALE_LABELS[locale]}
            </p>
          </div>
          <button onClick={handleClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "mb-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all",
            dragOver
              ? "border-brand-500 bg-brand-500/5"
              : file
                ? "border-medical-green/30 bg-medical-green/5"
                : "border-white/10 bg-white/[0.02]"
          )}
        >
          {file ? (
            <div className="flex items-center gap-3">
              <FileVideo className="h-8 w-8 text-medical-green" />
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload
                className={cn("mb-2 h-8 w-8", dragOver ? "text-brand-400" : "text-slate-500")}
              />
              <p className="mb-1 text-sm text-slate-300">
                {dragOver ? "Drop to upload" : "Drag & drop a video file"}
              </p>
              <p className="mb-3 text-xs text-slate-500">MP4 or WebM, max 20MB</p>
              <button
                onClick={() => inputRef.current?.click()}
                className={cn(buttonStyles("secondary", "sm"), "text-xs")}
              >
                Browse Files
              </button>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-medical-red/10 px-4 py-3 text-sm text-medical-red">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Title / Description */}
        <div className="mb-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title"
            className="w-full rounded-xl border border-white/10 bg-surface-base px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-500/40 focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-surface-base px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-500/40 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleClose} className={cn(buttonStyles("secondary", "lg"), "flex-1")}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file}
            className={cn(buttonStyles("primary", "lg"), "flex-1 disabled:opacity-40")}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
