// MenuMitra Backend Entry Point
// Developed by Abhijit Kumar Misra

const path = require('path');
// Standard dotenv v16 - does NOT override existing env vars by default
try { require('dotenv').config({ path: path.resolve(__dirname, '.env') }); } catch(e) {}

// Production environment variable injection fallbacks to ensure Railway works out-of-the-box
const fallbackEnv = {
  DATABASE_URL: "postgresql://postgres.xacjlxzwjivwxhheqnmr:Juxtapose%4085@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  DIRECT_URL: "postgresql://postgres.xacjlxzwjivwxhheqnmr:Juxtapose%4085@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres",
  JWT_SECRET: "menumitrasecretjwttokenstring12345678901234567890123456789012",
  JWT_ADMIN_SECRET: "menumitraadminsecretjwttokenstring12345678901234567890123456789012",
  JWT_REFRESH_SECRET: "menumitrarefreshsecretjwttokenstring12345678901234567890123456789012",
  ADMIN_LOGIN_ID: "Jitu",
  ADMIN_EMAIL: "abhijit.jituwreath@gmail.com",
  ADMIN_PASSWORD: "admin123",
  NODE_ENV: "production"
};

for (const [key, value] of Object.entries(fallbackEnv)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

// Start the server
async function main() {
  // Note: Database tables are managed directly (no Prisma migration files).
  // Prisma Client is used for queries only. No migrate deploy needed.
  require('./src/app');
}

main().catch(err => {
  console.error('[Startup] Fatal error:', err);
  process.exit(1);
});
