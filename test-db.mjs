import { neon } from '@neondatabase/serverless';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const sql = neon(process.env.DATABASE_URL);

try {
  const result = await sql`SELECT 1 as test`;
  console.log('DB connection OK:', JSON.stringify(result));
} catch (e) {
  console.error('DB connection FAILED:', e.message);
  if (e.cause) console.error('Cause:', e.cause);
}
