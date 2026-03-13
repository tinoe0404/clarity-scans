import { db, dbOne } from "../db";
import { SessionRecord, VideoSlug, Locale } from "@/types";
import { withQueryCache } from "../queryCache";

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

export async function updateSessionDeviceType(
  sessionId: string,
  deviceType: SessionRecord["device_type"]
): Promise<void> {
  const sql = `UPDATE sessions SET device_type = $1 WHERE id = $2`;
  await db.query(sql, [deviceType, sessionId]);
}

export interface SessionsSummary {
  totalSessions: number;
  languageDistribution: Record<Locale, number>;
  deviceDistribution: Record<string, number>;
  avgModulesCompleted: number;
  allModulesCompletedRate: number;
  dailyCounts: { date: string; count: number }[];
  allTimeTotal: number;
  moduleCompletionRates: { moduleId: string; completions: number; rate: number }[];
}

export async function getSessionsSummaryUncached(
  dateRange: "week" | "month" | "all"
): Promise<SessionsSummary> {
  let dateFilter = "";
  if (dateRange === "week") dateFilter = "AND started_at >= now() - interval '7 days'";
  if (dateRange === "month") dateFilter = "AND started_at >= now() - interval '30 days'";

  // 1. Core aggregates
  const sqlAgg = `
    SELECT 
      COUNT(id) as total_range,
      AVG(CARDINALITY(completed_modules)) as avg_modules,
      COUNT(id) FILTER (WHERE CARDINALITY(completed_modules) = 5)::float / NULLIF(COUNT(id), 0)::float as all_completed_rate
    FROM sessions 
    WHERE 1=1 ${dateFilter}
  `;

  // 2. Distributions
  const sqlLang = `SELECT language, COUNT(id) FROM sessions WHERE 1=1 ${dateFilter} GROUP BY language`;
  const sqlDevice = `SELECT device_type, COUNT(id) FROM sessions WHERE 1=1 ${dateFilter} GROUP BY device_type`;

  // 3. Daily Timeline mapping exactly grouping timestamps
  const sqlTimeline = `
    SELECT date_trunc('day', started_at) as day, COUNT(id) 
    FROM sessions 
    WHERE 1=1 ${dateFilter} 
    GROUP BY day 
    ORDER BY day ASC
    LIMIT 365
  `;

  // 4. Global total
  const sqlAllTime = `SELECT COUNT(id) as all_time FROM sessions`;

  // 5. Module Completions
  const sqlModules = `
    SELECT unnest(completed_modules) as module_id, COUNT(id) as completions
    FROM sessions
    WHERE 1=1 ${dateFilter}
    GROUP BY module_id
  `;

  const [agg, langs, devices, timeline, allTime, moduleStats] = await Promise.all([
    dbOne<Record<string, string>>(sqlAgg),
    db.query<{ language: string; count: string }>(sqlLang),
    db.query<{ device_type: string; count: string }>(sqlDevice),
    db.query<{ day: Date; count: string }>(sqlTimeline),
    dbOne<{ all_time: string }>(sqlAllTime),
    db.query<{ module_id: string; completions: string }>(sqlModules),
  ]);

  const langDist: Record<Locale, number> = { en: 0, sn: 0, nd: 0 };
  langs.forEach((l) => {
    if (l.language === "en" || l.language === "sn" || l.language === "nd") {
      langDist[l.language] = parseInt(l.count, 10);
    }
  });

  const deviceDist: Record<string, number> = {};
  devices.forEach((d) => {
    deviceDist[d.device_type] = parseInt(d.count, 10);
  });

  const dailyCounts = timeline.map((t) => ({
    date: t.day ? (new Date(t.day).toISOString().split("T")[0] as string) : "",
    count: parseInt(t.count, 10),
  })).filter(t => t.date !== "");

  const totalSessionsVal = parseInt(agg?.total_range || "0", 10);

  const moduleCompletionRates = moduleStats.map((m) => ({
    moduleId: m.module_id,
    completions: parseInt(m.completions, 10),
    rate: totalSessionsVal > 0 ? parseInt(m.completions, 10) / totalSessionsVal : 0,
  }));

  return {
    totalSessions: totalSessionsVal,
    languageDistribution: langDist,
    deviceDistribution: deviceDist,
    avgModulesCompleted: parseFloat(agg?.avg_modules || "0") || 0,
    allModulesCompletedRate: parseFloat(agg?.all_completed_rate || "0") || 0,
    dailyCounts,
    allTimeTotal: parseInt(allTime?.all_time || "0", 10),
    moduleCompletionRates,
  };
}

export const getSessionsSummary = Object.assign(
  async (dateRange: "week" | "month" | "all") => {
    return withQueryCache(
      () => getSessionsSummaryUncached(dateRange),
      [`sessions-summary-${dateRange}`],
      30 // Cache for 30 seconds
    )();
  },
  { uncached: getSessionsSummaryUncached }
);
