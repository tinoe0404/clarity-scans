import { db, dbOne } from "../db";
import { FeedbackRecord } from "@/types";
import { CreateFeedbackInput } from "../validations";

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

export async function getFeedbackSummary(
  dateRange: "week" | "month" | "all"
): Promise<FeedbackSummary> {
  let dateFilter = "";
  if (dateRange === "week") dateFilter = "AND created_at >= now() - interval '7 days'";
  if (dateRange === "month") dateFilter = "AND created_at >= now() - interval '30 days'";

  const sql = `
    SELECT 
      COUNT(DISTINCT session_id) as "totalSessions",
      COUNT(id) as "totalFeedback",
      AVG(anxiety_before) as "avgAnxietyBefore",
      AVG(anxiety_after) as "avgAnxietyAfter",
      AVG(anxiety_before - anxiety_after) FILTER (WHERE anxiety_before IS NOT NULL AND anxiety_after IS NOT NULL) as "avgAnxietyReduction",
      COUNT(id) FILTER (WHERE app_helpful = true)::float / NULLIF(COUNT(id) FILTER (WHERE app_helpful IS NOT NULL), 0)::float as "helpfulRate",
      COUNT(id) FILTER (WHERE understood_procedure = true)::float / NULLIF(COUNT(id) FILTER (WHERE understood_procedure IS NOT NULL), 0)::float as "understoodRate"
    FROM feedback
    WHERE 1=1 ${dateFilter}
  `;

  const result = await dbOne<Record<string, string>>(sql);

  return {
    totalSessions: parseInt(result?.totalSessions || "0", 10),
    totalFeedback: parseInt(result?.totalFeedback || "0", 10),
    avgAnxietyBefore: parseFloat(result?.avgAnxietyBefore || "0") || 0,
    avgAnxietyAfter: parseFloat(result?.avgAnxietyAfter || "0") || 0,
    avgAnxietyReduction: parseFloat(result?.avgAnxietyReduction || "0") || 0,
    helpfulRate: parseFloat(result?.helpfulRate || "0") || 0,
    understoodRate: parseFloat(result?.understoodRate || "0") || 0,
  };
}

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
