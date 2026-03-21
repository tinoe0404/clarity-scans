const { neon } = require('@neondatabase/serverless');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const dbUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL:', dbUrl?.substring(0, 50) + '...');
console.log('Node version:', process.version);

const sql = neon(dbUrl);

sql`SELECT 1 as test`
  .then(r => console.log('DB connection OK:', JSON.stringify(r)))
  .catch(e => {
    console.error('ERROR:', e.message);
    console.error('Full error:', e);
    if (e.cause) {
      console.error('Cause message:', e.cause.message);
      console.error('Cause code:', e.cause.code);
      console.error('Full cause:', e.cause);
    }
  });
