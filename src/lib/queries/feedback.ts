import { db, dbOne } from "../db";
import { FeedbackRecord, Locale } from "@/types";
import { CreateFeedbackInput } from "../validations";
import { withQueryCache } from "../queryCache";

export interface FeedbackSummary {
  totalSessions: number;
  avgAnxietyBefore: number;
  avgAnxietyAfter: number;
  avgAnxietyReduction: number;
  helpfulRate: number;
  understoodRate: number;
  totalFeedback: number;
}

export async function createFeedback(data: CreateFeedbackInput): Promise<FeedbackRecord> {
  const sql = `
    INSERT INTO feedback (
      session_id, understood_procedure, anxiety_before, anxiety_after, app_helpful, comments, submitted_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const result = await dbOne<FeedbackRecord>(sql, [
    data.sessionId,
    data.understoodProcedure ?? null,
    data.anxietyBefore ?? null,
    data.anxietyAfter ?? null,
    data.appHelpful ?? null,
    data.comments ?? null,
    data.submittedBy,
  ]);
  if (!result) throw new Error("Failed to insert feedback.");
  return result;
}

export async function getFeedbackBySessionId(sessionId: string): Promise<FeedbackRecord | null> {
  const sql = `SELECT * FROM feedback WHERE session_id = $1 LIMIT 1`;
  return dbOne<FeedbackRecord>(sql, [sessionId]);
}

export interface FeedbackSummary {
  totalSessions: number;
  avgAnxietyBefore: number;
  avgAnxietyAfter: number;
  avgAnxietyReduction: number;
  helpfulRate: number;
  understoodRate: number;
  positiveReductionRate: number;
  totalFeedback: number;
  distributionBefore: Record<string, number>;
  distributionAfter: Record<string, number>;
  dailyCounts: { date: string; count: number }[];
  languageDistribution: Record<Locale, number>;
}

export async function getFeedbackSummaryUncached(
  dateRange: "week" | "month" | "all"
): Promise<FeedbackSummary> {
  let dateFilter = "";
  if (dateRange === "week") dateFilter = "AND f.created_at >= now() - interval '7 days'";
  if (dateRange === "month") dateFilter = "AND f.created_at >= now() - interval '30 days'";

  const sqlAgg = `
    SELECT 
      COUNT(DISTINCT f.session_id) as "totalSessions",
      COUNT(f.id) as "totalFeedback",
      AVG(f.anxiety_before) as "avgAnxietyBefore",
      AVG(f.anxiety_after) as "avgAnxietyAfter",
      AVG(f.anxiety_before - f.anxiety_after) FILTER (WHERE f.anxiety_before IS NOT NULL AND f.anxiety_after IS NOT NULL) as "avgAnxietyReduction",
      
      COUNT(f.id) FILTER (WHERE (f.anxiety_before - f.anxiety_after) > 0)::float / NULLIF(COUNT(f.id) FILTER (WHERE f.anxiety_before IS NOT NULL AND f.anxiety_after IS NOT NULL), 0)::float as "positiveReductionRate",
      
      COUNT(f.id) FILTER (WHERE f.app_helpful = true)::float / NULLIF(COUNT(f.id) FILTER (WHERE f.app_helpful IS NOT NULL), 0)::float as "helpfulRate",
      COUNT(f.id) FILTER (WHERE f.understood_procedure = true)::float / NULLIF(COUNT(f.id) FILTER (WHERE f.understood_procedure IS NOT NULL), 0)::float as "understoodRate",

      -- distribution metrics mapped out explicitly
      COUNT(f.id) FILTER(WHERE f.anxiety_before = 1) as "b1",
      COUNT(f.id) FILTER(WHERE f.anxiety_before = 2) as "b2",
      COUNT(f.id) FILTER(WHERE f.anxiety_before = 3) as "b3",
      COUNT(f.id) FILTER(WHERE f.anxiety_before = 4) as "b4",
      COUNT(f.id) FILTER(WHERE f.anxiety_before = 5) as "b5",

      COUNT(f.id) FILTER(WHERE f.anxiety_after = 1) as "a1",
      COUNT(f.id) FILTER(WHERE f.anxiety_after = 2) as "a2",
      COUNT(f.id) FILTER(WHERE f.anxiety_after = 3) as "a3",
      COUNT(f.id) FILTER(WHERE f.anxiety_after = 4) as "a4",
      COUNT(f.id) FILTER(WHERE f.anxiety_after = 5) as "a5"
      
    FROM feedback f
    WHERE 1=1 ${dateFilter}
  `;

  // Explicit JOIN mapping Feedback entries successfully directly back to Session language logs guaranteeing valid Locales reliably!
  const sqlLang = `
    SELECT s.language, COUNT(f.id) 
    FROM feedback f
    JOIN sessions s ON f.session_id = s.id
    WHERE 1=1 ${dateFilter}
    GROUP BY s.language
  `;

  const sqlTimeline = `
    SELECT date_trunc('day', f.created_at) as day, COUNT(f.id) 
    FROM feedback f
    WHERE 1=1 ${dateFilter} 
    GROUP BY day 
    ORDER BY day ASC
    LIMIT 365
  `;

  const [agg, langs, timeline] = await Promise.all([
    dbOne<Record<string, string>>(sqlAgg),
    db.query<{ language: string; count: string }>(sqlLang),
    db.query<{ day: Date; count: string }>(sqlTimeline),
  ]);

  const langDist: Record<Locale, number> = { en: 0, sn: 0, nd: 0 };
  langs.forEach((l) => {
    if (l.language === "en" || l.language === "sn" || l.language === "nd") {
      langDist[l.language] = parseInt(l.count, 10);
    }
  });

  const dailyCounts = timeline.map((t) => ({
    date: t.day ? (new Date(t.day).toISOString().split("T")[0] as string) : "",
    count: parseInt(t.count, 10),
  })).filter(t => t.date !== "");

  return {
    totalSessions: parseInt(agg?.totalSessions || "0", 10),
    totalFeedback: parseInt(agg?.totalFeedback || "0", 10),
    avgAnxietyBefore: parseFloat(agg?.avgAnxietyBefore || "0") || 0,
    avgAnxietyAfter: parseFloat(agg?.avgAnxietyAfter || "0") || 0,
    avgAnxietyReduction: parseFloat(agg?.avgAnxietyReduction || "0") || 0,
    helpfulRate: parseFloat(agg?.helpfulRate || "0") || 0,
    understoodRate: parseFloat(agg?.understoodRate || "0") || 0,
    positiveReductionRate: parseFloat(agg?.positiveReductionRate || "0") || 0,
    distributionBefore: {
      "1": parseInt(agg?.b1 || "0", 10),
      "2": parseInt(agg?.b2 || "0", 10),
      "3": parseInt(agg?.b3 || "0", 10),
      "4": parseInt(agg?.b4 || "0", 10),
      "5": parseInt(agg?.b5 || "0", 10),
    },
    distributionAfter: {
      "1": parseInt(agg?.a1 || "0", 10),
      "2": parseInt(agg?.a2 || "0", 10),
      "3": parseInt(agg?.a3 || "0", 10),
      "4": parseInt(agg?.a4 || "0", 10),
      "5": parseInt(agg?.a5 || "0", 10),
    },
    dailyCounts,
    languageDistribution: langDist,
  };
}

export const getFeedbackSummary = Object.assign(
  async (dateRange: "week" | "month" | "all") => {
    return withQueryCache(
      () => getFeedbackSummaryUncached(dateRange),
      [`feedback-summary-${dateRange}`],
      30 // Cache for 30s
    )();
  },
  { uncached: getFeedbackSummaryUncached }
);

export async function getAllFeedback(
  page: number,
  pageSize: number
): Promise<{ rows: FeedbackRecord[]; total: number }> {
  const offset = (page - 1) * pageSize;
  const data = await db.query<FeedbackRecord>(
    `
    SELECT * FROM feedback 
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2
  `,
    [pageSize, offset]
  );

  const totalRes = await dbOne<{ count: string }>("SELECT COUNT(*) as count FROM feedback");
  const total = parseInt(totalRes?.count || "0", 10);

  return { rows: data, total };
}
