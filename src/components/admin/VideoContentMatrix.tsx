/* eslint-disable @next/next/no-img-element */
"use client";

import { Image as ImageIcon, Upload } from "lucide-react";
import VideoMatrixCell from "./VideoMatrixCell";
import VideoMetadataEditor from "./VideoMetadataEditor";
import type { VideoRecord, VideoSlug, Locale } from "@/types";
import { VIDEO_MODULE_SLUGS, SUPPORTED_LOCALES } from "@/lib/constants";

const MODULE_META: Record<VideoSlug, { label: string; icon: string; important?: boolean }> = {
  "what-is-ct": { label: "What is CT?", icon: "🔬" },
  prepare: { label: "Preparation", icon: "📋" },
  breathhold: { label: "Breath Hold", icon: "🫁", important: true },
  contrast: { label: "Contrast", icon: "💉" },
  "staying-still": { label: "Staying Still", icon: "🧘" },
};

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  sn: "ChiShona",
  nd: "isiNdebele",
};

interface UploadProgressEntry {
  progress: number;
  fileName: string;
}

interface VideoContentMatrixProps {
  matrix: Record<string, Record<string, VideoRecord | null>>;
  uploadProgress: Record<string, UploadProgressEntry | null>;
  editingCellKey: string | null;
  isBulkMode: boolean;
  selectedCells: Set<string>;
  onUploadClick: (slug: VideoSlug, locale: Locale) => void;
  onCancelUpload: (slug: VideoSlug, locale: Locale) => void;
  onEditClick: (cellKey: string) => void;
  onEditClose: () => void;
  onSaveMetadata: (id: string, title: string, description: string, expectedUpdatedAt?: string) => Promise<boolean>;
  onDelete: (video: VideoRecord) => void;
  onToggleActive: (video: VideoRecord, newActive: boolean) => void;
  onBulkSelect: (cellKey: string, selected: boolean) => void;
  onThumbnailUpload: (slug: VideoSlug) => void;
  thumbnails: Record<string, string | null>;
}

function getCellKey(slug: string, locale: string) {
  return `${slug}__${locale}`;
}

export default function VideoContentMatrix({
  matrix,
  uploadProgress,
  editingCellKey,
  isBulkMode,
  selectedCells,
  onUploadClick,
  onCancelUpload,
  onEditClick,
  onEditClose,
  onSaveMetadata,
  onDelete,
  onToggleActive,
  onBulkSelect,
  onThumbnailUpload,
  thumbnails,
}: VideoContentMatrixProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-surface-border">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Module
            </th>
            {SUPPORTED_LOCALES.map((loc) => (
              <th
                key={loc}
                className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                {LOCALE_LABELS[loc]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VIDEO_MODULE_SLUGS.map((slug) => {
            const meta = MODULE_META[slug];
            const thumb = thumbnails[slug] || null;

            return (
              <tr key={slug} className="border-b border-surface-border last:border-0">
                {/* Module label column */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-white">{meta.label}</span>
                        {meta.important && (
                          <span className="rounded bg-medical-amber/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-medical-amber">
                            Key
                          </span>
                        )}
                      </div>
                      {/* Thumbnail preview + upload */}
                      <div className="mt-1 flex items-center gap-2">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={`${meta.label} thumbnail`}
                            className="h-6 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-10 items-center justify-center rounded bg-white/5">
                            <ImageIcon className="h-3 w-3 text-white/20" />
                          </div>
                        )}
                        <button
                          onClick={() => onThumbnailUpload(slug)}
                          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300"
                        >
                          <Upload className="h-3 w-3" />
                          {thumb ? "Change" : "Set"} Thumbnail
                        </button>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Locale cells */}
                {SUPPORTED_LOCALES.map((loc) => {
                  const cellKey = getCellKey(slug, loc);
                  const video = matrix[slug]?.[loc] || null;
                  const progress = uploadProgress[cellKey] || null;
                  const isEditing = editingCellKey === cellKey;

                  return (
                    <td key={loc} className="px-3 py-3">
                      {isEditing && video ? (
                        <VideoMetadataEditor
                          videoId={video.id}
                          initialTitle={video.title}
                          initialDescription={video.description}
                          updatedAt={new Date(video.updated_at).toISOString()}
                          onSave={onSaveMetadata}
                          onClose={onEditClose}
                        />
                      ) : (
                        <VideoMatrixCell
                          video={video}
                          uploadProgress={progress?.progress ?? null}
                          uploadFileName={progress?.fileName ?? null}
                          isBulkMode={isBulkMode}
                          isSelected={selectedCells.has(cellKey)}
                          onUpload={() => onUploadClick(slug, loc)}
                          onCancelUpload={() => onCancelUpload(slug, loc)}
                          onEdit={() => onEditClick(cellKey)}
                          onDelete={() => video && onDelete(video)}
                          onToggleActive={(active) => video && onToggleActive(video, active)}
                          onBulkSelect={(sel) => onBulkSelect(cellKey, sel)}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
