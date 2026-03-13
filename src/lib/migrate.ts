import fs from "fs";
import path from "path";
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const sql = neon(connectionString);
const MIGRATIONS_DIR = path.join(process.cwd(), "src/lib/migrations");

export async function runMigrations() {
  console.log("Starting database migrations...");

  try {
    // 1. Create migrations tracking table (single command)
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        ran_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    // 2. Fetch already run migrations
    const ranMigrationsResult = await sql`SELECT filename FROM _migrations`;
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
      const fileContent = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

      // Split by statements while respecting dollar-quoted blocks ($$)
      const statements: string[] = [];
      let currentStatement = "";
      let inDollarQuote = false;

      // Handle both \r\n and \n
      const rawLines = fileContent.split(/\r?\n/);
      for (const line of rawLines) {
        currentStatement += line + "\n";
        
        // Toggle dollar quote state if we see $$
        if (line.includes("$$")) {
          // Count occurrences to handle cases where it might appear twice on one line (unlikely in DDL)
          const occurrences = (line.match(/\$\$/g) || []).length;
          if (occurrences % 2 !== 0) {
            inDollarQuote = !inDollarQuote;
          }
        }

        if (!inDollarQuote && line.trim().endsWith(";")) {
          statements.push(currentStatement.trim());
          currentStatement = "";
        }
      }
      
      const finalStmt = currentStatement.trim();
      if (finalStmt) {
        statements.push(finalStmt);
      }

      try {
        for (const statement of statements) {
            if (!statement) continue;
            // Neon requires tagged templates for the default sql function. 
            // For raw unparameterized strings, we can use sql.query.
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            await (sql as any).query(statement);
        }

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        await (sql as any).query(`INSERT INTO _migrations (filename) VALUES ('${file}')`);

        console.log(`Successfully completed: ${file}`);
      } catch (err: unknown) {
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
