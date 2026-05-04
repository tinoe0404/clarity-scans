import { db, dbOne } from "../db";
import { VideoRecord, VideoSlug, Locale } from "@/types";
import { UpsertVideoInput } from "../validations";
import { withQueryCache } from "../queryCache";

export async function getVideosByLanguageUncached(language: Locale): Promise<VideoRecord[]> {
  const sql = `
    SELECT * FROM videos 
    WHERE language = $1 AND is_active = true 
    ORDER BY sort_order ASC
    LIMIT 100
  `;
  return db.query<VideoRecord>(sql, [language]);
}

export const getVideosByLanguage = Object.assign(
  async (language: Locale) => {
    return withQueryCache(
      () => getVideosByLanguageUncached(language),
      [`videos-${language}`],
      3600 // Cache for 1 hour
    )();
  },
  { uncached: getVideosByLanguageUncached }
);

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
    LIMIT 100
  `;
  return db.query<VideoRecord>(sql);
}

export async function updateVideoThumbnail(slug: VideoSlug, thumbnailUrl: string): Promise<void> {
  const sql = `UPDATE videos SET thumbnail_url = $1, updated_at = now() WHERE slug = $2`;
  await db.query(sql, [thumbnailUrl, slug]);
}

export async function upsertVideo(data: UpsertVideoInput): Promise<VideoRecord> {
  const sql = `
    INSERT INTO videos (slug, language, title, description, blob_url, thumbnail_url, duration_seconds, is_active, uploaded_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (slug, language) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      blob_url = EXCLUDED.blob_url,
      thumbnail_url = EXCLUDED.thumbnail_url,
      duration_seconds = EXCLUDED.duration_seconds,
      is_active = EXCLUDED.is_active,
      uploaded_by = EXCLUDED.uploaded_by,
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
    data.uploadedBy || null,
  ]);
  if (!result) throw new Error("Upsert failed entirely");
  return result;
}

export async function getVideoById(id: string): Promise<VideoRecord | null> {
  const sql = `SELECT * FROM videos WHERE id = $1 LIMIT 1`;
  return dbOne<VideoRecord>(sql, [id]);
}

export async function updateVideoMetadata(
  id: string,
  data: Partial<UpsertVideoInput>
): Promise<VideoRecord | null> {
  // Construct dynamic SQL natively bridging partial parameters cleanly avoiding wiping blob arrays
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.durationSeconds !== undefined) {
    updates.push(`duration_seconds = $${paramIndex++}`);
    values.push(data.durationSeconds);
  }
  if (data.isActive !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    values.push(data.isActive);
  }
  if (data.thumbnailUrl !== undefined) {
    updates.push(`thumbnail_url = $${paramIndex++}`);
    values.push(data.thumbnailUrl);
  }

  // Fallback safely if empty
  if (updates.length === 0) return getVideoById(id);

  updates.push(`updated_at = now()`);
  values.push(id);

  const sql = `
    UPDATE videos 
    SET ${updates.join(", ")} 
    WHERE id = $${paramIndex}
    RETURNING *;
  `;

  return dbOne<VideoRecord>(sql, values);
}

export async function updateVideoActiveStatus(id: string, isActive: boolean): Promise<void> {
  const sql = `UPDATE videos SET is_active = $1 WHERE id = $2`;
  await db.query(sql, [isActive, id]);
}

export async function deleteVideo(id: string): Promise<void> {
  const sql = `DELETE FROM videos WHERE id = $1`;
  await db.query(sql, [id]);
}
