import { neon, neonConfig } from "@neondatabase/serverless";

// Configure fetch for Neon so it works correctly in Next.js Serverless and Edge
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;

function getNeonClient() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Please set the DATABASE_URL environment variable to your Neon connection string. " +
        "You can find this in your Neon Dashboard: https://neon.tech -> New Project -> Connection string. " +
        "If working locally, add it to your .env.local file."
    );
  }
  return neon(connectionString);
}

// Lazy initialization wrapper so it doesn't throw during build or module load
// only when actually queried if the env variable isn't set.
export const db = {
  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const sqlClient = getNeonClient();
    // The neon client types primarily expect tagged template literals,
    // but it supports standard parameterized queries at runtime.
    /* eslint-disable no-unused-vars */
    const result = await (
      sqlClient as unknown as (_query: string, _params: unknown[]) => Promise<T[]>
    )(sql, params);
    /* eslint-enable no-unused-vars */
    return result;
  },

  async queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? (rows[0] ?? null) : null;
  },
};

export const dbOne = db.queryOne.bind(db);

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const result = await db.query<{ one: number }>("SELECT 1 as one");

    // We expect result to be [{ one: 1 }]
    if (!result || result.length === 0 || result[0]?.one !== 1) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: "Database connected but query 'SELECT 1' returned unexpected result.",
      };
    }

    return { healthy: true, latencyMs: Date.now() - start };
  } catch (error: unknown) {
    return {
      healthy: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown database connection error",
    };
  }
}
