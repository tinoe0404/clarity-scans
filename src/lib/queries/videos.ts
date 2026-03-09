import { db, dbOne } from "../db";
import { VideoRecord, VideoSlug, Locale } from "@/types";
import { UpsertVideoInput } from "../validations";

export async function getVideosByLanguage(language: Locale): Promise<VideoRecord[]> {
  const sql = `
    SELECT * FROM videos 
    WHERE language = $1 AND is_active = true 
    ORDER BY sort_order ASC
  `;
  return db.query<VideoRecord>(sql, [language]);
}

export async function getVideoBySlug(
  slug: VideoSlug,
  language: Locale
): Promise<VideoRecord | null> {
  const sql = `
    SELECT * FROM videos 
    WHERE slug = $1 AND language = $2 AND is_active = true
    LIMIT 1
  `;
  return dbOne<VideoRecord>(sql, [slug, language]);
}

export async function getAllVideos(): Promise<VideoRecord[]> {
  const sql = `
    SELECT * FROM videos 
    ORDER BY language ASC, sort_order ASC
  `;
  return db.query<VideoRecord>(sql);
}

export async function upsertVideo(data: UpsertVideoInput): Promise<VideoRecord> {
  const sql = `
    INSERT INTO videos (slug, language, title, description, blob_url, thumbnail_url, duration_seconds, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (slug, language) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      blob_url = EXCLUDED.blob_url,
      thumbnail_url = EXCLUDED.thumbnail_url,
      duration_seconds = EXCLUDED.duration_seconds,
      is_active = EXCLUDED.is_active,
      updated_at = now()
    RETURNING *;
  `;
  const result = await dbOne<VideoRecord>(sql, [
    data.slug,
    data.language,
    data.title,
    data.description || null,
    data.blobUrl,
    data.thumbnailUrl || null,
    data.durationSeconds || null,
    data.isActive ?? true,
  ]);
  if (!result) throw new Error("Upsert failed entirely");
  return result;
}

export async function updateVideoActiveStatus(id: string, isActive: boolean): Promise<void> {
  const sql = `UPDATE videos SET is_active = $1 WHERE id = $2`;
  await db.query(sql, [isActive, id]);
}

export async function deleteVideo(id: string): Promise<void> {
  const sql = `DELETE FROM videos WHERE id = $1`;
  await db.query(sql, [id]);
}
