"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import { adminFetch } from "@/lib/adminFetch";
import { handleClientError } from "@/lib/globalErrorHandler";

interface OrphanedBlob {
  url: string;
  size?: number;
}

interface StorageCleanupPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function StorageCleanupPanel({
  isOpen,
  onClose,
  onComplete,
}: StorageCleanupPanelProps) {
  const [orphaned, setOrphaned] = useState<OrphanedBlob[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchOrphaned = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/storage");
      const json = await res.json();
      if (json.success) {
        setOrphaned((json.data.orphanedBlobs as string[]).map((url) => ({ url })));
      }
    } catch (error) {
      handleClientError(error, "StorageCleanupPanel - fetchOrphaned");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchOrphaned();
  }, [isOpen, fetchOrphaned]);

  const deleteOne = async (url: string) => {
    setDeleting((prev) => new Set(prev).add(url));
    try {
      const res = await adminFetch("/api/admin/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [url] }),
      });
      if (res.ok) {
        setOrphaned((prev) => prev.filter((b) => b.url !== url));
      }
    } catch (error) {
      handleClientError(error, "StorageCleanupPanel - deleteOne");
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    }
  };

  const deleteAll = async () => {
    if (orphaned.length === 0) return;
    setDeletingAll(true);
    try {
      const urls = orphaned.map((b) => b.url);
      const res = await adminFetch("/api/admin/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      if (res.ok) {
        setOrphaned([]);
        onComplete();
      }
    } catch (error) {
      handleClientError(error, "StorageCleanupPanel - deleteAll");
    } finally {
      setDeletingAll(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl border border-surface-border bg-surface-card p-6 md:max-h-[80vh] md:rounded-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Clean Up Storage</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
          </div>
        ) : orphaned.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-medical-green/10">
              <AlertTriangle className="h-6 w-6 text-medical-green" />
            </div>
            <p className="text-sm text-slate-400">No orphaned files found. Storage is clean!</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                {orphaned.length} orphaned file{orphaned.length !== 1 ? "s" : ""} found
              </p>
              <button
                onClick={deleteAll}
                disabled={deletingAll}
                className={cn(
                  buttonStyles("primary", "sm"),
                  "flex items-center gap-1.5 bg-medical-red text-xs hover:bg-medical-red/80"
                )}
              >
                {deletingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                Delete All
              </button>
            </div>

            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {orphaned.map((blob) => (
                <div
                  key={blob.url}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <span className="max-w-[280px] truncate text-xs text-slate-300">
                    {blob.url.split("/").pop()}
                  </span>
                  <button
                    onClick={() => deleteOne(blob.url)}
                    disabled={deleting.has(blob.url)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-medical-red/10 hover:text-medical-red"
                  >
                    {deleting.has(blob.url) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
