import { db, dbOne } from "../db";
import { RadioNoteRecord, Locale } from "@/types";
import { CreateNoteInput } from "../validations";

export interface NotesSummary {
  totalNotes: number;
  breathholdComplianceRate: number;
  repeatScanRate: number;
  languageDistribution: Record<Locale, number>;
}

export async function createNote(data: CreateNoteInput): Promise<RadioNoteRecord> {
  const sql = `
    INSERT INTO radiographer_notes (
      session_id, followed_breathhold, repeat_scan_required, language_used, comments, radiographer_id
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const result = await dbOne<RadioNoteRecord>(sql, [
    data.sessionId,
    data.followedBreathhold,
    data.repeatScanRequired,
    data.languageUsed,
    data.comments ?? null,
    data.radiographerId ?? null,
  ]);
  if (!result) throw new Error("Failed to create note");
  return result;
}

export async function getNotesSummary(dateRange: "week" | "month" | "all"): Promise<NotesSummary> {
  let dateFilter = "";
  if (dateRange === "week") dateFilter = "AND created_at >= now() - interval '7 days'";
  if (dateRange === "month") dateFilter = "AND created_at >= now() - interval '30 days'";

  const sqlStats = `
    SELECT 
      COUNT(id) as "totalNotes",
      COUNT(id) FILTER (WHERE followed_breathhold = true)::float / NULLIF(COUNT(id), 0)::float as "breathholdComplianceRate",
      COUNT(id) FILTER (WHERE repeat_scan_required = true)::float / NULLIF(COUNT(id), 0)::float as "repeatScanRate"
    FROM radiographer_notes
    WHERE 1=1 ${dateFilter}
  `;

  const sqlLangs = `
    SELECT language_used as lang, COUNT(id) as count
    FROM radiographer_notes
    WHERE 1=1 ${dateFilter}
    GROUP BY language_used
  `;

  const stats = await dbOne<Record<string, string>>(sqlStats);
  const langs = await db.query<{ lang: string; count: string }>(sqlLangs);

  const languageDistribution: Record<Locale, number> = { en: 0, sn: 0, nd: 0 };
  for (const l of langs) {
    if (l.lang === "en" || l.lang === "sn" || l.lang === "nd") {
      languageDistribution[l.lang] = parseInt(l.count, 10);
    }
  }

  return {
    totalNotes: parseInt(stats?.totalNotes || "0", 10),
    breathholdComplianceRate: parseFloat(stats?.breathholdComplianceRate || "0") || 0,
    repeatScanRate: parseFloat(stats?.repeatScanRate || "0") || 0,
    languageDistribution,
  };
}

export async function getAllNotes(
  page: number,
  pageSize: number
): Promise<{ rows: RadioNoteRecord[]; total: number }> {
  const offset = (page - 1) * pageSize;
  const data = await db.query<RadioNoteRecord>(
    `
      SELECT * FROM radiographer_notes 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `,
    [pageSize, offset]
  );

  const totalRes = await dbOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM radiographer_notes"
  );
  const total = parseInt(totalRes?.count || "0", 10);

  return { rows: data, total };
}

export async function deleteNote(id: string): Promise<void> {
  const result = await dbOne<{ id: string }>(
    "DELETE FROM radiographer_notes WHERE id = $1 RETURNING id",
    [id]
  );
  if (!result) throw new Error("Note not found or could not be deleted");
}

export async function getCalendarHeatmap(): Promise<{ date: string; count: number }[]> {
  const sql = `
    SELECT day::date::text AS date, COALESCE(COUNT(n.id), 0)::integer AS count
    FROM generate_series(
      (now() AT TIME ZONE 'Africa/Harare')::date - interval '83 days',
      (now() AT TIME ZONE 'Africa/Harare')::date,
      interval '1 day'
    ) AS day
    LEFT JOIN radiographer_notes n 
      ON (n.created_at AT TIME ZONE 'Africa/Harare')::date = day::date
    GROUP BY day
    ORDER BY day ASC;
  `;
  const result = await db.query<{ date: string; count: number }>(sql);
  return result;
}
