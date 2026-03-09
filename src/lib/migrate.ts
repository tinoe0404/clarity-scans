import fs from "fs";
import path from "path";
import { db } from "./db";

const MIGRATIONS_DIR = path.join(process.cwd(), "src/lib/migrations");

export async function runMigrations() {
  console.log("Starting database migrations...");

  try {
    // 1. Create migrations tracking table
    await db.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        ran_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 2. Fetch already run migrations
    const ranMigrationsResult = await db.query<{ filename: string }>(
      `SELECT filename FROM _migrations`
    );
    const ranMigrations = new Set(ranMigrationsResult.map((m) => m.filename));

    // 3. Read migration files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b));

    // 4. Execute pending migrations
    for (const file of files) {
      if (ranMigrations.has(file)) {
        console.log(`Skipping: ${file} (already run)`);
        continue;
      }

      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

      try {
        await db.query("BEGIN");

        // Split file content by statement since serverless driver might have issues with multiple statements
        // But doing it all at once if supported by Neon (Neon supports multiple statements in postgres engine but sometimes driver restricts).
        // Let's pass the whole SQL block first and wrap in generic transaction.
        await db.query(sql);

        await db.query(`INSERT INTO _migrations (filename) VALUES ($1)`, [file]);

        await db.query("COMMIT");
        console.log(`Successfully completed: ${file}`);
      } catch (err: unknown) {
        await db.query("ROLLBACK");
        console.error(`Migration failed for ${file}:`, err instanceof Error ? err.message : err);
        throw err;
      }
    }

    console.log("Database migrations completed successfully.");
    return true;
  } catch (error: unknown) {
    console.error("Migration runner failed:", error instanceof Error ? error.message : error);
    throw error;
  }
}

// Allow execution direct via tsx
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
