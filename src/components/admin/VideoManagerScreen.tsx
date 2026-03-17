/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef, useMemo } from "react";

import { CheckSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import { SUPPORTED_LOCALES, VIDEO_MODULE_SLUGS } from "@/lib/constants";
import dynamic from "next/dynamic";

import { adminFetch } from "@/lib/adminFetch";
import { handleClientError } from "@/lib/globalErrorHandler";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

import StorageUsageBar from "./StorageUsageBar";
import StorageCleanupPanel from "./StorageCleanupPanel";
import VideoContentMatrix from "./VideoContentMatrix";

const ConfirmDialog = dynamic(() => import("@/components/ui").then((mod) => mod.ConfirmDialog), { ssr: false });
const VideoUploadPanel = dynamic(() => import("./VideoUploadPanel"), { ssr: false });
import BulkActionBar from "./BulkActionBar";
import type { VideoRecord, StorageStats, VideoSlug, Locale } from "@/types";

/* ── Helpers ────────────────────────────────────────── */

function getCellKey(slug: string, locale: string) {
  return `${slug}__${locale}`;
}

function parseCellKey(key: string): { slug: VideoSlug; locale: Locale } {
  const [slug, locale] = key.split("__");
  return { slug: slug as VideoSlug, locale: locale as Locale };
}

interface UploadProgressEntry {
  progress: number;
  fileName: string;
  xhr?: XMLHttpRequest;
}

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "warning";
}

/* ── Threshold for XHR vs client upload ─────────────── */
const SERVER_UPLOAD_LIMIT = 4 * 1024 * 1024; // 4MB

/* ── Props ──────────────────────────────────────────── */
interface VideoManagerScreenProps {
  initialGrouped: Record<string, VideoRecord[]>;
  initialStats: StorageStats | null;
}

export default function VideoManagerScreen({
  initialGrouped,
  initialStats,
}: VideoManagerScreenProps) {
  /* ── Build initial matrix ─────────────────────── */
  const buildMatrix = useCallback((grouped: Record<string, VideoRecord[]>) => {
    const m: Record<string, Record<string, VideoRecord | null>> = {};
    for (const slug of VIDEO_MODULE_SLUGS) {
      m[slug] = {};
      for (const loc of SUPPORTED_LOCALES) {
        m[slug][loc] = null;
      }
    }
    for (const [slug, videos] of Object.entries(grouped)) {
      for (const v of videos) {
        if (m[slug]) m[slug][v.language] = v;
      }
    }
    return m;
  }, []);

  /* ── State ────────────────────────────────────── */
  const [matrix, setMatrix] = useState(() => buildMatrix(initialGrouped));
  const [stats, setStats] = useState(initialStats);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgressEntry | null>>(
    {}
  );
  const [editingCellKey, setEditingCellKey] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VideoRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const isOnline = useOnlineStatus();

  // Upload panel
  const [uploadPanel, setUploadPanel] = useState<{ slug: VideoSlug; locale: Locale } | null>(null);

  // Bulk mode
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgressText, setBulkProgressText] = useState("");

  // Cleanup panel
  const [cleanupOpen, setCleanupOpen] = useState(false);

  // Thumbnail file input ref
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [thumbSlug, setThumbSlug] = useState<VideoSlug | null>(null);

  /* ── Thumbnails map ──────────────────────────── */
  const thumbnails = useMemo(() => {
    const t: Record<string, string | null> = {};
    for (const slug of VIDEO_MODULE_SLUGS) {
      const row = matrix[slug];
      let thumb: string | null = null;
      for (const loc of SUPPORTED_LOCALES) {
        if (row?.[loc]?.thumbnail_url) {
          thumb = row[loc]?.thumbnail_url || null;
          break;
        }
      }
      t[slug] = thumb;
    }
    return t;
  }, [matrix]);

  /* ── Toast helpers ───────────────────────────── */
  const addToast = useCallback((message: string, type: ToastItem["type"]) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  /* ── Refresh stats ───────────────────────────── */
  const refreshStats = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/videos?includeStats=true");
      const json = await res.json();
      if (json.success) {
        setMatrix(buildMatrix(json.data.grouped));
        setStats(json.data.stats);
      }
    } catch (error) {
      handleClientError(error, "VideoManagerScreen - refreshStats");
    }
  }, [buildMatrix]);

  /* ── Upload: XHR (< 4 MB) ───────────────────── */
  const uploadViaXhr = useCallback(
    (slug: VideoSlug, locale: Locale, file: File, title: string, description: string) => {
      const cellKey = getCellKey(slug, locale);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", slug);
      formData.append("language", locale);
      formData.append("title", title);
      formData.append("description", description);

      const xhr = new XMLHttpRequest();
      setUploadProgress((prev) => ({
        ...prev,
        [cellKey]: { progress: 0, fileName: file.name, xhr },
      }));

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress((prev) => ({
            ...prev,
            [cellKey]: prev[cellKey]
              ? { ...(prev[cellKey] as UploadProgressEntry), progress: pct }
              : null,
          }));
        }
      };

      xhr.onload = () => {
        setUploadProgress((prev) => ({ ...prev, [cellKey]: null }));
        if (xhr.status >= 200 && xhr.status < 300) {
          addToast("Video uploaded successfully", "success");
          refreshStats();
        } else {
          addToast("Upload failed — please try again", "error");
        }
      };

      xhr.onerror = () => {
        setUploadProgress((prev) => ({ ...prev, [cellKey]: null }));
        addToast("Upload failed — network error", "error");
      };

      xhr.open("POST", "/api/admin/upload");
      xhr.send(formData);
    },
    [addToast, refreshStats]
  );

  /* ── Upload: R2 presigned URL (4–20 MB) ────────── */
  const uploadViaPresignedUrl = useCallback(
    async (slug: VideoSlug, locale: Locale, file: File, title: string, description: string) => {
      const cellKey = getCellKey(slug, locale);
      setUploadProgress((prev) => ({
        ...prev,
        [cellKey]: { progress: 0, fileName: file.name },
      }));

      try {
        // 1. Get presigned URL from our API
        const tokenRes = await adminFetch("/api/admin/upload/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            slug,
            locale,
            title,
            description,
          }),
        });
        const tokenJson = await tokenRes.json();
        if (!tokenJson.success) throw new Error(tokenJson.error || "Failed to get upload URL");

        const { presignedUrl, key } = tokenJson.data;

        // 2. Upload directly to R2 via XHR for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setUploadProgress((prev) => ({
                ...prev,
                [cellKey]: prev[cellKey]
                  ? { ...(prev[cellKey] as UploadProgressEntry), progress: pct, xhr }
                  : null,
              }));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`R2 upload failed with status ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("R2 upload network error"));

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        // 3. Register the upload in the database
        const completeRes = await adminFetch("/api/admin/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key,
            slug,
            locale,
            title,
            description,
            fileSize: file.size,
          }),
        });
        const completeJson = await completeRes.json();

        setUploadProgress((prev) => ({ ...prev, [cellKey]: null }));

        if (completeJson.success) {
          addToast("Video uploaded successfully", "success");
          refreshStats();
        } else {
          addToast(
            "Upload completed but DB record failed — refresh the page to verify",
            "warning"
          );
        }
      } catch (error) {
        handleClientError(error, "VideoManagerScreen - uploadViaPresignedUrl");
        setUploadProgress((prev) => ({ ...prev, [cellKey]: null }));
        addToast("Direct upload failed — please try again", "error");
      }
    },
    [addToast, refreshStats]
  );

  /* ── Upload router ───────────────────────────── */
  const handleUpload = useCallback(
    (file: File, title: string, description: string) => {
      if (!uploadPanel) return;
      const { slug, locale } = uploadPanel;
      if (file.size < SERVER_UPLOAD_LIMIT) {
        uploadViaXhr(slug, locale, file, title, description);
      } else {
        uploadViaPresignedUrl(slug, locale, file, title, description);
      }
    },
    [uploadPanel, uploadViaXhr, uploadViaPresignedUrl]
  );

  /* ── Cancel upload ───────────────────────────── */
  const handleCancelUpload = useCallback(
    (slug: VideoSlug, locale: Locale) => {
      const cellKey = getCellKey(slug, locale);
      const entry = uploadProgress[cellKey];
      if (entry?.xhr) entry.xhr.abort();
      setUploadProgress((prev) => ({ ...prev, [cellKey]: null }));
    },
    [uploadProgress]
  );

  /* ── Toggle active status ────────────────────── */
  const handleToggleActive = useCallback(
    async (video: VideoRecord, newActive: boolean) => {
      const previous = matrix[video.slug]?.[video.language];

      // Optimistic
      setMatrix((prev) => ({
        ...prev,
        [video.slug]: {
          ...prev[video.slug],
          [video.language]: { ...video, is_active: newActive },
        },
      }));

      try {
        const res = await adminFetch(`/api/admin/videos/${video.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            isActive: newActive,
            expectedUpdatedAt: video.updated_at // Optimistic locking guard
          }),
        });
        if (res.status === 409) {
          throw new Error("Conflict: This video was modified by another user. Please refresh.");
        }
        if (!res.ok) throw new Error("Failed");
        
        // Background sync to ensure we get the latest DB state (updated_at etc)
        refreshStats();
        addToast(newActive ? "Video activated" : "Video deactivated", "success");
      } catch (error: any) {
        // Revert
        setMatrix((prev) => ({
          ...prev,
          [video.slug]: { ...prev[video.slug], [video.language]: previous || null },
        }));
        handleClientError(error, "VideoManagerScreen - handleToggleActive");
        addToast(error.message?.includes("Conflict") ? error.message : "Failed to update status — reverted", "error");
      }
    },
    [matrix, addToast, refreshStats]
  );

  /* ── Save metadata ───────────────────────────── */
  const handleSaveMetadata = useCallback(
    async (id: string, title: string, description: string, expectedUpdatedAt?: string): Promise<boolean> => {
      try {
        const res = await adminFetch(`/api/admin/videos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title, 
            description,
            expectedUpdatedAt // Optimistic locking
          }),
        });
        if (res.status === 409) {
          throw new Error("Conflict: This video was modified by another user. Please refresh.");
        }
        if (!res.ok) throw new Error("Failed to save metadata");
        const json = await res.json();
        if (json.success && json.data) {
          const updated = json.data as VideoRecord;
          setMatrix((prev) => ({
            ...prev,
            [updated.slug]: {
              ...prev[updated.slug],
              [updated.language]: updated,
            },
          }));
        }
        return true;
      } catch (error: any) {
        handleClientError(error, "VideoManagerScreen - handleSaveMetadata");
        addToast(error.message?.includes("Conflict") ? error.message : "Failed to save metadata — reverted", "error");
        return false;
      }
    },
    [addToast]
  );

  /* ── Delete ──────────────────────────────────── */
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await adminFetch(`/api/admin/videos/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMatrix((prev) => ({
        ...prev,
        [deleteTarget.slug]: {
          ...prev[deleteTarget.slug],
          [deleteTarget.language]: null,
        },
      }));
      addToast("Video deleted", "success");
      refreshStats();
    } catch (error) {
      handleClientError(error, "VideoManagerScreen - handleDeleteConfirm");
      addToast("Failed to delete video — try again", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, addToast, refreshStats]);

  /* ── Bulk operations ─────────────────────────── */
  const handleBulkOperation = useCallback(
    async (activate: boolean) => {
      const keys = Array.from(selectedCells);
      const targets: VideoRecord[] = [];
      for (const key of keys) {
        const { slug, locale } = parseCellKey(key);
        const v = matrix[slug]?.[locale];
        if (v) targets.push(v);
      }
      if (targets.length === 0) return;

      setBulkProcessing(true);
      let done = 0;
      for (const video of targets) {
        done++;
        setBulkProgressText(`Updating ${done} of ${targets.length} videos...`);
        await handleToggleActive(video, activate);
      }
      setBulkProcessing(false);
      setBulkProgressText("");
      setSelectedCells(new Set());
      setIsBulkMode(false);
    },
    [selectedCells, matrix, handleToggleActive]
  );

  /* ── Thumbnail upload ────────────────────────── */
  const handleThumbnailUploadClick = useCallback((slug: VideoSlug) => {
    setThumbSlug(slug);
    thumbInputRef.current?.click();
  }, []);

  const handleThumbnailFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !thumbSlug) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", thumbSlug);

      try {
        const res = await adminFetch("/api/admin/upload/thumbnail", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          addToast("Thumbnail updated", "success");
          refreshStats();
        } else {
          addToast("Thumbnail upload failed", "error");
        }
      } catch (error) {
        handleClientError(error, "VideoManagerScreen - handleThumbnailFile");
        addToast("Thumbnail upload failed — network error", "error");
      } finally {
        if (thumbInputRef.current) thumbInputRef.current.value = "";
        setThumbSlug(null);
      }
    },
    [thumbSlug, addToast, refreshStats]
  );

  /* ── Bulk select handler ─────────────────────── */
  const handleBulkSelect = useCallback((cellKey: string, selected: boolean) => {
    setSelectedCells((prev) => {
      const next = new Set(prev);
      if (selected) next.add(cellKey);
      else next.delete(cellKey);
      return next;
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Video Manager</h1>
          <p className="text-sm text-slate-400">
            Upload, manage, and toggle patient education videos
          </p>
        </div>
        <button
          onClick={() => {
            setIsBulkMode(!isBulkMode);
            setSelectedCells(new Set());
          }}
          className={cn(
            buttonStyles("secondary", "sm"),
            "flex items-center gap-1.5 text-xs",
            isBulkMode && "bg-brand-500/10 text-brand-400"
          )}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          {isBulkMode ? "Done" : "Select"}
        </button>
      </div>

      {/* Storage usage */}
      <StorageUsageBar stats={stats} onCleanup={() => setCleanupOpen(true)} />

      {/* Content matrix */}
      <VideoContentMatrix
        matrix={matrix}
        uploadProgress={uploadProgress}
        editingCellKey={editingCellKey}
        isBulkMode={isBulkMode}
        selectedCells={selectedCells}
        onUploadClick={(slug, locale) => {
          if (!isOnline) {
            addToast("Cannot upload while offline", "warning");
            return;
          }
          setUploadPanel({ slug, locale });
        }}
        onCancelUpload={handleCancelUpload}
        onEditClick={setEditingCellKey}
        onEditClose={() => setEditingCellKey(null)}
        onSaveMetadata={handleSaveMetadata}
        onDelete={setDeleteTarget}
        onToggleActive={handleToggleActive}
        onBulkSelect={handleBulkSelect}
        onThumbnailUpload={handleThumbnailUploadClick}
        thumbnails={thumbnails}
      />

      {/* Upload panel */}
      {uploadPanel && (
        <VideoUploadPanel
          isOpen
          slug={uploadPanel.slug}
          locale={uploadPanel.locale}
          onClose={() => setUploadPanel(null)}
          onUpload={handleUpload}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen
          title="Delete this video?"
          message="The file will be permanently removed from storage and cannot be recovered."
          confirmLabel={deleteLoading ? "Deleting..." : "Delete"}
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Storage cleanup panel */}
      <StorageCleanupPanel
        isOpen={cleanupOpen}
        onClose={() => setCleanupOpen(false)}
        onComplete={() => {
          setCleanupOpen(false);
          refreshStats();
          addToast("Orphaned files cleaned up", "success");
        }}
      />

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selectedCells.size}
        isProcessing={bulkProcessing}
        progressText={bulkProgressText}
        onActivateAll={() => handleBulkOperation(true)}
        onDeactivateAll={() => handleBulkOperation(false)}
        onCancel={() => {
          setSelectedCells(new Set());
          setIsBulkMode(false);
        }}
      />

      {/* Hidden thumbnail input */}
      <input
        ref={thumbInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleThumbnailFile}
      />

      {/* Toast notifications */}
      <div className="fixed bottom-28 right-4 z-50 flex flex-col gap-2 md:bottom-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "animate-in slide-in-from-right fade-in flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl duration-300",
              toast.type === "success" && "bg-medical-green/90 text-white",
              toast.type === "error" && "bg-medical-red/90 text-white",
              toast.type === "warning" && "bg-medical-amber/90 text-black"
            )}
          >
            {toast.message}
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-1 rounded p-0.5 hover:bg-black/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
