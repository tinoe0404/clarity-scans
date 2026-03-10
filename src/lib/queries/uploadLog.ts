import { db } from "../db";
import type { Locale } from "@/types";

export type UploadAction = "upload_video" | "upload_thumbnail" | "delete_video" | "delete_blob";

export interface UploadLogEntry {
  action: UploadAction;
  slug?: string;
  locale?: Locale;
  blob_url?: string;
  file_size_bytes?: number;
  success: boolean;
  error_message?: string;
}

/**
 * Logs all storage operations explicitly ensuring Audit tracks exist matching Vercel Storage limits
 */
export async function logUploadAction(data: UploadLogEntry): Promise<void> {
  const sql = `
    INSERT INTO upload_log (
      action, slug, locale, blob_url, file_size_bytes, success, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  try {
    await db.query(sql, [
      data.action,
      data.slug || null,
      data.locale || null,
      data.blob_url || null,
      data.file_size_bytes || null,
      data.success,
      data.error_message || null,
    ]);
  } catch (err) {
    // Failing to write an audit log should never crash the actual upload operation,
    // so we catch and log it silently to the server console instead natively.
    console.error("CRITICAL: Failed to write to upload_log", err);
  }
}
