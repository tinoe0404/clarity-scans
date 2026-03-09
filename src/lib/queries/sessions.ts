import { db, dbOne } from "../db";
import { SessionRecord, VideoSlug, Locale } from "@/types";

export async function createSession(
  language: Locale,
  deviceType: SessionRecord["device_type"]
): Promise<SessionRecord> {
  const sql = `
    INSERT INTO sessions (language, device_type)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const result = await dbOne<SessionRecord>(sql, [language, deviceType]);
  if (!result) throw new Error("Could not create session");
  return result;
}

export async function updateSessionModules(
  sessionId: string,
  completedModules: VideoSlug[]
): Promise<void> {
  // Use Postgres array literal notation
  const sql = `
    UPDATE sessions 
    SET completed_modules = $1, last_active_at = now()
    WHERE id = $2
  `;
  // Construct array format recognizable by driver if node-postgres doesn't perfectly abstract it
  // But node-postgres standardly accepts JS arrays for text[] mapping if properly cast
  // neon serverless supports passing arrays as JS arrays directly
  await db.query(sql, [completedModules, sessionId]);
}

export async function getSessionById(id: string): Promise<SessionRecord | null> {
  const sql = `SELECT * FROM sessions WHERE id = $1 LIMIT 1`;
  return dbOne<SessionRecord>(sql, [id]);
}

export async function touchSession(sessionId: string): Promise<void> {
  const sql = `UPDATE sessions SET last_active_at = now() WHERE id = $1`;
  await db.query(sql, [sessionId]);
}
