import { Client } from "@neondatabase/serverless";

function getNeonClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Please set the DATABASE_URL environment variable to your Neon connection string. " +
        "You can find this in your Neon Dashboard: https://neon.tech -> New Project -> Connection string. " +
        "If working locally, add it to your .env.local file."
    );
  }
  return new Client({ connectionString });
}

// Lazy initialization wrapper so it doesn't throw during build or module load
// only when actually queried if the env variable isn't set.
export const db = {
  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const client = getNeonClient();
    await client.connect();

    try {
      // Apply a 10s statement_timeout to prevent runaway queries
      // on Neon serverless (each invocation creates a fresh connection)
      await client.query("SET statement_timeout = '10s'");

      const result = await client.query(sql, params);
      
      // pg returns arrays of results for multi-query strings sometimes, but normally an object with rows.
      // We'll normalize it to just rows for our app functions.
      if (Array.isArray(result)) {
        // Find the last statement that returned rows or just return empty
        const withRows = result.filter(r => r.rows);
        return (withRows.length > 0 ? withRows[withRows.length - 1].rows : []) as T[];
      }

      return (result.rows || []) as T[];
    } finally {
      await client.end();
    }
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
