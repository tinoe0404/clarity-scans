"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Save, X, Loader2 } from "lucide-react";

interface VideoMetadataEditorProps {
  videoId: string;
  initialTitle: string;
  initialDescription: string;
  onSave: (id: string, title: string, description: string) => Promise<boolean>;
  onClose: () => void;
}

export default function VideoMetadataEditor({
  videoId,
  initialTitle,
  initialDescription,
  onSave,
  onClose,
}: VideoMetadataEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const [autoSaveLabel, setAutoSaveLabel] = useState<string | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const isDirty = title !== initialTitle || description !== initialDescription;

  const doSave = useCallback(
    async (isAuto = false) => {
      if (!isDirty) return;
      setSaving(true);
      if (isAuto) setAutoSaveLabel("Saving...");
      try {
        const ok = await onSave(videoId, title, description);
        if (ok && isAuto) {
          setAutoSaveLabel("Saved");
          setTimeout(() => setAutoSaveLabel(null), 2000);
        }
      } finally {
        setSaving(false);
      }
    },
    [videoId, title, description, isDirty, onSave]
  );

  // Auto-save after 2s inactivity
  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(true), 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, description, isDirty, doSave]);

  const handleManualSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    await doSave(false);
    onClose();
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-brand-500/20 bg-surface-elevated p-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Video title"
        className="w-full rounded-lg border border-white/10 bg-surface-base px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500/40 focus:outline-none"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="w-full resize-none rounded-lg border border-white/10 bg-surface-base px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-brand-500/40 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-slate-500">
          {autoSaveLabel && (
            <span className="flex items-center gap-1">
              {autoSaveLabel === "Saving..." && <Loader2 className="h-3 w-3 animate-spin" />}
              {autoSaveLabel}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleManualSave}
            disabled={!isDirty || saving}
            className="flex h-[32px] items-center gap-1 rounded-lg bg-brand-500/10 px-3 text-[10px] font-medium text-brand-400 transition-colors hover:bg-brand-500/20 disabled:opacity-40"
          >
            <Save className="h-3 w-3" />
            Save
          </button>
          <button
            onClick={onClose}
            className="flex h-[32px] items-center gap-1 rounded-lg px-3 text-[10px] text-slate-400 hover:bg-white/5"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
